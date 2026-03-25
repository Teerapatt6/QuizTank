const db = require('../config/db');

const calculateXP = (game) => {
    // Logic updated to match src/utils/gameDifficulty.ts
    const questionsCount = Array.isArray(game.questions) ? game.questions.length : 0;
    // Defaults matching frontend GameDetails.tsx
    // Using || operator handles null, undefined, and 0 (for ammo_per_correct and enemies) exactly like the frontend
    const initial_ammo = game.initial_ammo || 0;
    const ammo_per_correct = game.ammo_per_correct || 1;
    const enemies = game.enemies || 1;

    const totalAmmo = initial_ammo + (ammo_per_correct * questionsCount);
    // To prevent division by zero, though enemies is max(1, ...)
    const ammoPerEnemy = totalAmmo / enemies;

    let xp = 50;
    if (ammoPerEnemy <= 1) xp = 500;
    else if (ammoPerEnemy <= 2) xp = 300;
    else if (ammoPerEnemy <= 3) xp = 200;
    else if (ammoPerEnemy <= 4) xp = 100;

    return xp;
};

const gamePlayModel = {
    /**
     * Create a new game play record
     */
    create: async (gameRoomId, userId) => {
        const query = `
            INSERT INTO game_plays (game_room_id, user_id, status)
            VALUES ($1, $2, 1)
            RETURNING *
        `;
        const result = await db.query(query, [gameRoomId, userId]);
        return result.rows[0];
    },

    /**
     * Update game play status and completion time
     */
    updateStatus: async (id, status, completionTime = null) => {
        const query = `
            UPDATE game_plays
            SET status = $2, completion_time = $3
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [id, status, completionTime]);
        const play = result.rows[0];

        if (play && status === 2) {
            // Check if this is the first win for this user on this game
            const checkQuery = `
                SELECT 1 FROM game_plays 
                WHERE user_id = $1 
                AND game_room_id = $2 
                AND status = 2 
                AND id != $3
                LIMIT 1
            `;
            const checkResult = await db.query(checkQuery, [play.user_id, play.game_room_id, play.id]);

            if (checkResult.rows.length === 0) {
                play.is_first_win = true;
                // First win! Calculate XP based on game difficulty
                const gameQuery = 'SELECT * FROM game_rooms WHERE id = $1';
                const gameResult = await db.query(gameQuery, [play.game_room_id]);

                let xpAmount = 100;
                if (gameResult.rows.length > 0) {
                    const gameData = gameResult.rows[0];

                    // If creator plays own game, don't award XP
                    if (gameData.user_id === play.user_id) {
                        return play;
                    }

                    xpAmount = calculateXP(gameData);
                }

                await db.query('UPDATE users SET xp = xp + $1 WHERE user_id = $2', [xpAmount, play.user_id]);
                play.xp_awarded = xpAmount;
            }

            // Check for New Best Record
            if (play.completion_time !== null) {
                const bestQuery = `
                    SELECT MIN(completion_time) as best_time 
                    FROM game_plays 
                    WHERE user_id = $1 
                    AND game_room_id = $2 
                    AND status = 2 
                    AND id != $3
                `;
                const bestResult = await db.query(bestQuery, [play.user_id, play.game_room_id, play.id]);
                const bestTime = bestResult.rows[0]?.best_time;

                // If no previous wins (bestTime is null) OR current time is better (lower)
                if (bestTime === null || parseFloat(play.completion_time) < parseFloat(bestTime)) {
                    play.is_new_best = true;
                }
            }
        }
        return play;
    },

    /**
     * Get all game plays (for admin)
     */
    getAll: async () => {
        const query = `
            SELECT 
                gp.*,
                u.username,
                u.full_name,
                u.email,
                gr.name as game_name,
                gr.game_code
            FROM game_plays gp
            LEFT JOIN users u ON gp.user_id = u.user_id
            LEFT JOIN game_rooms gr ON gp.game_room_id = gr.id
            ORDER BY gp.created_at DESC
        `;
        const result = await db.query(query);
        return result.rows;
    },

    /**
     * Get plays by user
     */
    getByUser: async (userId) => {
        const query = `
            SELECT gp.*, gr.name as game_name
            FROM game_plays gp
            JOIN game_rooms gr ON gp.game_room_id = gr.id
            WHERE gp.user_id = $1
            ORDER BY gp.created_at DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    },

    /**
     * Get leaderboard for a game (Best time per user)
     */
    getLeaderboard: async (gameRoomId) => {
        const query = `
            SELECT * FROM (
                SELECT DISTINCT ON (gp.user_id) 
                    gp.id,
                    gp.user_id, 
                    gp.completion_time, 
                    gp.created_at, 
                    u.username, 
                    u.full_name,
                    u.profile_pic_url
                FROM game_plays gp
                JOIN users u ON gp.user_id = u.user_id
                WHERE gp.game_room_id = $1 
                AND gp.status = 2 
                AND gp.completion_time IS NOT NULL
                ORDER BY gp.user_id, gp.completion_time ASC
            ) sub
            ORDER BY completion_time ASC
            LIMIT 1000
        `;
        const result = await db.query(query, [gameRoomId]);
        return result.rows;
    },

    /**
     * Get game stats (total plays, user plays, passed, failed)
     */
    getGameStats: async (gameRoomId, userId = null) => {
        // Get total plays (status 2 or 3) and passed count
        const totalQuery = `
            SELECT 
                COUNT(*) as total_plays,
                COUNT(*) FILTER (WHERE status = 2) as total_passed
            FROM game_plays
            WHERE game_room_id = $1 AND status IN (2, 3)
        `;
        const totalResult = await db.query(totalQuery, [gameRoomId]);
        const totalPlays = parseInt(totalResult.rows[0]?.total_plays || 0);
        const totalPassed = parseInt(totalResult.rows[0]?.total_passed || 0);
        const globalWinRate = totalPlays > 0 ? Math.round((totalPassed / totalPlays) * 100) : 0;

        let userStats = {
            gamesPlayed: 0,
            passed: 0,
            failed: 0,
            passedRate: 0,
            failedRate: 0
        };

        if (userId) {
            const userQuery = `
                SELECT 
                    COUNT(*) FILTER (WHERE status IN (2, 3)) as games_played,
                    COUNT(*) FILTER (WHERE status = 2) as passed,
                    COUNT(*) FILTER (WHERE status = 3) as failed
                FROM game_plays
                WHERE game_room_id = $1 AND user_id = $2
            `;
            const userResult = await db.query(userQuery, [gameRoomId, userId]);
            const row = userResult.rows[0];

            userStats.gamesPlayed = parseInt(row?.games_played || 0);
            userStats.passed = parseInt(row?.passed || 0);
            userStats.failed = parseInt(row?.failed || 0);

            if (userStats.gamesPlayed > 0) {
                userStats.passedRate = Math.round((userStats.passed / userStats.gamesPlayed) * 100);
                userStats.failedRate = Math.round((userStats.failed / userStats.gamesPlayed) * 100);
            }
        }

        return {
            totalPlays,
            totalPassed,
            globalWinRate,
            ...userStats
        };
    },


    /**
     * Get user's play history for a game
     */
    getGameHistory: async (gameRoomId, userId) => {
        const query = `
            SELECT 
                id, 
                status, 
                completion_time, 
                created_at,
                (
                    SELECT id 
                    FROM game_plays 
                    WHERE game_room_id = $1 
                      AND user_id = $2 
                      AND status = 2
                    ORDER BY completion_time ASC, created_at ASC 
                    LIMIT 1
                ) as best_play_id
            FROM game_plays
            WHERE game_room_id = $1 
              AND user_id = $2
              AND status IN (2, 3) -- Completed plays only (Passed or Failed)
            ORDER BY created_at DESC
        `;
        const result = await db.query(query, [gameRoomId, userId]);
        return result.rows.map(row => ({
            ...row,
            isBest: row.id === row.best_play_id
        }));
    }
};

module.exports = gamePlayModel;
