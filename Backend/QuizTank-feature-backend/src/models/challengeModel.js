const db = require('../config/db');

module.exports = {
    /**
     * Get active challenges for the given type and date (UTC).
     * @param {string} type - 'DAILY' or 'WEEKLY'
     * @param {string} dateRef - UTC date string in 'YYYY-MM-DD' format
     */
    getActiveChallenges: async (type, dateRef) => {
        const typeId = type === 'DAILY' ? 1 : 2;

        const sql = `
            SELECT *
            FROM challenges
            WHERE status = 1
              AND type_id = $1
              AND start_date::date = $2::date
            ORDER BY created_at DESC
        `;

        const { rows } = await db.query(sql, [typeId, dateRef]);
        return rows;
    },

    // --- Admin CRUD ---
    getAll: async () => {
        const sql = 'SELECT * FROM challenges ORDER BY created_at DESC';
        const { rows } = await db.query(sql);
        return rows;
    },

    getById: async (id) => {
        const sql = 'SELECT * FROM challenges WHERE challenge_id = $1';
        const { rows } = await db.query(sql, [id]);
        return rows[0];
    },

    create: async (data) => {
        const sql = `
            INSERT INTO challenges (
                title, description, difficulty, 
                game_room, xp, status, type_id, start_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            data.title, data.description, data.difficulty,
            JSON.stringify(data.game_room || []),
            data.xp || 0, data.status || 1, data.type_id || 1,
            data.start_date || null
        ];
        const { rows } = await db.query(sql, values);
        return rows[0];
    },

    update: async (id, data) => {
        const allowedFields = [
            'title', 'description', 'difficulty',
            'game_room', 'xp', 'status', 'type_id', 'start_date'
        ];

        const updates = [];
        const values = [];
        let idx = 1;

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updates.push(`${field} = $${idx}`);
                values.push(field === 'game_room' ? JSON.stringify(data[field]) : data[field]);
                idx++;
            }
        }

        if (updates.length === 0) return null;

        const sql = `
            UPDATE challenges 
            SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE challenge_id = $${idx}
            RETURNING *
        `;
        values.push(id);

        const { rows } = await db.query(sql, values);
        return rows[0];
    },

    delete: async (id) => {
        const sql = 'DELETE FROM challenges WHERE challenge_id = $1 RETURNING *';
        const { rows } = await db.query(sql, [id]);
        return rows[0];
    },

    /**
     * Get user's progress for a challenge by counting wins in game_plays
     * @param {number} userId - The user's ID
     * @param {number[]} gameRoomIds - Array of game room IDs for the challenge
     * @returns {number} Number of unique games the user has won
     */
    getUserProgress: async (userId, gameRoomIds) => {
        if (!gameRoomIds || gameRoomIds.length === 0) return 0;

        // Convert JS array to JSONB and use jsonb_array_elements for proper matching
        const sql = `
            SELECT COUNT(DISTINCT game_room_id) as progress
            FROM game_plays
            WHERE user_id = $1
              AND status = 2
              AND game_room_id IN (
                  SELECT (jsonb_array_elements_text($2::jsonb))::int
              )
        `;
        const { rows } = await db.query(sql, [userId, JSON.stringify(gameRoomIds)]);
        return parseInt(rows[0]?.progress || 0, 10);
    },

    /**
     * Get list of game IDs the user has won for a challenge
     */
    getCompletedGameIds: async (userId, gameRoomIds) => {
        if (!gameRoomIds || gameRoomIds.length === 0) return [];

        const sql = `
            SELECT DISTINCT game_room_id
            FROM game_plays
            WHERE user_id = $1
              AND status = 2
              AND game_room_id IN (
                  SELECT (jsonb_array_elements_text($2::jsonb))::int
              )
        `;
        const { rows } = await db.query(sql, [userId, JSON.stringify(gameRoomIds)]);
        return rows.map(r => r.game_room_id);
    },

    /**
     * Check if user has already claimed reward for a challenge
     */
    isRewardClaimed: async (userId, challengeId) => {
        const sql = `
            SELECT 1 FROM challenge_completed 
            WHERE user_id = $1 AND challenge_id = $2
        `;
        const { rows } = await db.query(sql, [userId, challengeId]);
        return rows.length > 0;
    },

    /**
     * Claim reward for completing a challenge
     * Returns { success: true, xp: number } or { success: false, error: string }
     */
    claimReward: async (userId, challengeId) => {
        // Check if already claimed
        const alreadyClaimed = await module.exports.isRewardClaimed(userId, challengeId);
        if (alreadyClaimed) {
            return { success: false, error: 'Reward already claimed' };
        }

        // Get challenge details
        const challenge = await module.exports.getById(challengeId);
        if (!challenge) {
            return { success: false, error: 'Challenge not found' };
        }

        // Verify user has completed all games
        const gameRoomIds = challenge.game_room || [];
        const completedGameIds = await module.exports.getCompletedGameIds(userId, gameRoomIds);

        if (completedGameIds.length < gameRoomIds.length) {
            return { success: false, error: 'Not all games completed' };
        }

        // Insert into challenge_completed
        await db.query(
            'INSERT INTO challenge_completed (user_id, challenge_id) VALUES ($1, $2)',
            [userId, challengeId]
        );

        // Add XP to user
        const xp = challenge.xp || 0;
        await db.query(
            'UPDATE users SET xp = xp + $1 WHERE user_id = $2',
            [xp, userId]
        );

        return { success: true, xp: xp };
    },

    /**
     * Get list of challenges completed by user
     */
    getCompletedChallenges: async (userId) => {
        const sql = `
            SELECT c.*, cc.created_at as completed_at
            FROM challenges c
            JOIN challenge_completed cc ON c.challenge_id = cc.challenge_id
            WHERE cc.user_id = $1 AND c.status = 1
            ORDER BY cc.created_at DESC
        `;
        const { rows } = await db.query(sql, [userId]);
        return rows;
    }
};