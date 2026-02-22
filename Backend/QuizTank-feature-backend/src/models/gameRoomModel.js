const db = require('../config/db');

/**
 * Game Room Model - Simplified single-table storage for games
 * All game data stored in one row with JSONB columns for questions, knowledges, tags
 */

/**
 * Generate a random 6-character alphanumeric game code (A-Z, 0-9)
 */
const generateGameCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

const gameRoomModel = {
    /**
     * Create a new game room
     */
    create: async (userId, gameData) => {
        const query = `
            INSERT INTO game_rooms (
                user_id, name, status, visibility, password,
                category, language, tags, description, cover_image,
                questions, knowledges,
                duration, enemies, hearts, brains,
                initial_ammo, ammo_per_correct, map, game_code,
                questions_order, knowledges_order
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10,
                $11, $12,
                $13, $14, $15, $16,
                $17, $18, $19, $20,
                $21, $22
            )
            RETURNING id, game_code
        `;

        let retries = 3;
        while (retries > 0) {
            const isCustomCode = !!gameData.game_code;
            let gameCode = gameData.game_code || generateGameCode();
            gameCode = gameCode.toUpperCase();
            const values = [
                userId,
                gameData.name || 'Untitled Game',
                gameData.status || 2, // Default to Draft
                gameData.visibility || 1, // Default to Public
                gameData.password || null,
                gameData.category || '',
                gameData.language || 'English',
                JSON.stringify(gameData.tags || []),
                gameData.description || '',
                gameData.cover_image || '',
                JSON.stringify(gameData.questions || []),
                JSON.stringify(gameData.knowledges || []),
                gameData.duration !== undefined ? gameData.duration : 4,
                gameData.enemies !== undefined ? gameData.enemies : 2,
                gameData.hearts !== undefined ? gameData.hearts : 3,
                gameData.brains !== undefined ? gameData.brains : 4,
                gameData.initial_ammo !== undefined ? gameData.initial_ammo : 50,
                gameData.ammo_per_correct !== undefined ? gameData.ammo_per_correct : 5,
                gameData.map !== undefined ? gameData.map : 1,
                gameCode,
                gameData.questions_order !== undefined ? gameData.questions_order : null,
                gameData.knowledges_order !== undefined ? gameData.knowledges_order : null
            ];

            try {
                const result = await db.query(query, values);
                return {
                    id: result.rows[0].id,
                    gameCode: result.rows[0].game_code
                };
            } catch (error) {
                // If unique constraint violation on game_code
                if (error.code === '23505' && (error.constraint === 'game_rooms_game_code_key' || error.detail?.includes('game_code'))) {
                    if (isCustomCode) {
                        throw new Error('Game code already exists. Please choose a different one.');
                    }
                    retries--;
                    if (retries === 0) throw new Error('Failed to generate unique game code');
                    continue;
                }
                throw error;
            }
        }
    },

    /**
     * Get a game room by ID
     */
    getById: async (id, userId = null) => {
        const query = `
            SELECT 
                gr.*,
                u.username as creator_name,
                u.full_name as creator_full_name,
                u.profile_pic_url as creator_avatar,
                (SELECT COALESCE(AVG(r.rating), 0)::float FROM reviews r WHERE r.game_room_id = gr.id) as rating,
                (SELECT COUNT(r.rating)::int FROM reviews r WHERE r.game_room_id = gr.id) as rating_count,
                 (SELECT COUNT(*)::int FROM game_favourites gf WHERE gf.game_room_id = gr.id AND gf.status = 1) as favorites_count,
                EXISTS(SELECT 1 FROM game_unlocked gu WHERE gu.game_room_id = gr.id AND gu.user_id = $2) as is_unlocked
            FROM game_rooms gr
            LEFT JOIN users u ON gr.user_id = u.user_id
            WHERE gr.id = $1 AND gr.status != 3
        `;
        const result = await db.query(query, [id, userId]);
        return result.rows[0] || null;
    },

    /**
     * Get a game room by ID for Admin (includes deleted games)
     */
    getByIdAdmin: async (id) => {
        const query = `
            SELECT 
                gr.*,
                u.username as creator_name
            FROM game_rooms gr
            LEFT JOIN users u ON gr.user_id = u.user_id
            WHERE gr.id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    },

    /**
     * Get a game room by Code
     */
    getByCode: async (code, userId = null) => {
        const query = `
            SELECT 
                gr.*,
                u.username as creator_name,
                u.full_name as creator_full_name,
                u.profile_pic_url as creator_avatar,
                (SELECT COALESCE(AVG(r.rating), 0)::float FROM reviews r WHERE r.game_room_id = gr.id) as rating,
                (SELECT COUNT(r.rating)::int FROM reviews r WHERE r.game_room_id = gr.id) as rating_count,
                (SELECT COUNT(*)::int FROM game_favourites gf WHERE gf.game_room_id = gr.id AND gf.status = 1) as favorites_count,
                EXISTS(SELECT 1 FROM game_unlocked gu WHERE gu.game_room_id = gr.id AND gu.user_id = $2) as is_unlocked
            FROM game_rooms gr
            LEFT JOIN users u ON gr.user_id = u.user_id
            WHERE gr.game_code = $1 AND gr.status != 3
        `;
        const result = await db.query(query, [code, userId]);
        return result.rows[0] || null;
    },

    /**
     * Get all games by user ID (My Games)
     */
    getByUserId: async (userId) => {
        const query = `
            SELECT *,
                (SELECT COALESCE(AVG(r.rating), 0)::float FROM reviews r WHERE r.game_room_id = game_rooms.id) as rating,
                (SELECT COUNT(r.rating)::int FROM reviews r WHERE r.game_room_id = game_rooms.id) as rating_count,
                (SELECT COUNT(*)::int FROM game_plays gp WHERE gp.game_room_id = game_rooms.id AND (gp.status = 2 OR gp.status = 3)) as play_count
            FROM game_rooms 
            WHERE user_id = $1 AND status != 3
            ORDER BY updated_at DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    },

    /**
     * Get all public games (for browsing)
     */
    getPublicGames: async (limit = 20, offset = 0, userId = null) => {
        const query = `
            SELECT 
                gr.id, gr.name, gr.category, gr.language, gr.tags,
                gr.description, gr.cover_image, gr.ai_generated, gr.duration,
                gr.questions, gr.knowledges, gr.enemies, gr.hearts, gr.brains, gr.initial_ammo, gr.ammo_per_correct,
                gr.created_at,
                gr.game_code,
                gr.game_code,
                u.username as creator_name,
                EXISTS(SELECT 1 FROM game_favourites gf WHERE gf.game_room_id = gr.id AND gf.user_id = $3 AND gf.status = 1) as is_favourite,
                (SELECT COALESCE(AVG(r.rating), 0)::float FROM reviews r WHERE r.game_room_id = gr.id) as rating,
                (SELECT COUNT(r.rating)::int FROM reviews r WHERE r.game_room_id = gr.id) as rating_count,
                (SELECT COUNT(*)::int FROM game_plays gp WHERE gp.game_room_id = gr.id AND (gp.status = 2 OR gp.status = 3)) as play_count
            FROM game_rooms gr
            LEFT JOIN users u ON gr.user_id = u.user_id
            WHERE gr.status = 1 AND gr.visibility = 1
            ORDER BY gr.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await db.query(query, [limit, offset, userId]);
        return result.rows;
    },

    /**
     * Get all public games by specific username
     */
    getByUsername: async (username, userId = null, limit = 20, offset = 0, sortBy = 'newest') => {
        let orderByClause = 'ORDER BY gr.created_at DESC';
        if (sortBy === 'popularity') orderByClause = 'ORDER BY play_count DESC';
        else if (sortBy === 'rating') orderByClause = 'ORDER BY rating DESC, rating_count DESC';

        const query = `
            SELECT 
                gr.id, gr.name, gr.category, gr.language, gr.tags,
                gr.description, gr.cover_image, gr.ai_generated, gr.duration,
                gr.questions, gr.knowledges, gr.enemies, gr.hearts, gr.brains, gr.initial_ammo, gr.ammo_per_correct,
                gr.created_at,
                gr.game_code,
                u.username as creator_name,
                EXISTS(SELECT 1 FROM game_favourites gf WHERE gf.game_room_id = gr.id AND gf.user_id = $2 AND gf.status = 1) as is_favourite,
                (SELECT COALESCE(AVG(r.rating), 0)::float FROM reviews r WHERE r.game_room_id = gr.id) as rating,
                (SELECT COUNT(r.rating)::int FROM reviews r WHERE r.game_room_id = gr.id) as rating_count,
                (SELECT COUNT(*)::int FROM game_plays gp WHERE gp.game_room_id = gr.id AND (gp.status = 2 OR gp.status = 3)) as play_count
            FROM game_rooms gr
            JOIN users u ON gr.user_id = u.user_id
            WHERE u.username = $1 
              AND gr.status = 1 
              AND gr.visibility = 1
            ${orderByClause}
            LIMIT $3 OFFSET $4
        `;
        const result = await db.query(query, [username, userId, limit, offset]);
        return result.rows;
    },

    /**
     * Search games
     */
    search: async (searchTerm, limit = 20, userId = null, offset = 0, sortBy = 'newest') => {
        let query;
        let values;
        let orderByClause = 'ORDER BY gr.created_at DESC';
        if (sortBy === 'popularity') orderByClause = 'ORDER BY play_count DESC';
        else if (sortBy === 'rating') orderByClause = 'ORDER BY rating DESC, rating_count DESC';

        if (searchTerm.startsWith('#')) {
            const tag = searchTerm.substring(1);
            query = `
                SELECT 
                    gr.id, gr.name, gr.category, gr.language, gr.tags,
                    gr.description, gr.cover_image, gr.ai_generated, gr.duration,
                    gr.questions, gr.knowledges, gr.enemies, gr.hearts, gr.brains, gr.initial_ammo, gr.ammo_per_correct,
                    gr.created_at,
                    gr.game_code,
                    u.username as creator_name,
                    EXISTS(SELECT 1 FROM game_favourites gf WHERE gf.game_room_id = gr.id AND gf.user_id = $3 AND gf.status = 1) as is_favourite,
                    (SELECT COALESCE(AVG(r.rating), 0)::float FROM reviews r WHERE r.game_room_id = gr.id) as rating,
                    (SELECT COUNT(r.rating)::int FROM reviews r WHERE r.game_room_id = gr.id) as rating_count,
                    (SELECT COUNT(*)::int FROM game_plays gp WHERE gp.game_room_id = gr.id AND (gp.status = 2 OR gp.status = 3)) as play_count
                FROM game_rooms gr
                LEFT JOIN users u ON gr.user_id = u.user_id
                WHERE gr.status = 1 AND gr.visibility = 1
                  AND EXISTS (
                      SELECT 1 FROM jsonb_array_elements_text(gr.tags::jsonb) t 
                      WHERE t ILIKE $1
                  )
                ${orderByClause}
                LIMIT $2 OFFSET $4
            `;
            values = [tag, limit, userId, offset];
        } else {
            query = `
                SELECT 
                    gr.id, gr.name, gr.category, gr.language, gr.tags,
                    gr.description, gr.cover_image, gr.ai_generated, gr.duration,
                    gr.questions, gr.knowledges, gr.enemies, gr.hearts, gr.brains, gr.initial_ammo, gr.ammo_per_correct,
                    gr.created_at,
                    gr.game_code,
                    u.username as creator_name,
                    EXISTS(SELECT 1 FROM game_favourites gf WHERE gf.game_room_id = gr.id AND gf.user_id = $3 AND gf.status = 1) as is_favourite,
                    (SELECT COALESCE(AVG(r.rating), 0)::float FROM reviews r WHERE r.game_room_id = gr.id) as rating,
                    (SELECT COUNT(r.rating)::int FROM reviews r WHERE r.game_room_id = gr.id) as rating_count,
                    (SELECT COUNT(*)::int FROM game_plays gp WHERE gp.game_room_id = gr.id AND (gp.status = 2 OR gp.status = 3)) as play_count
                FROM game_rooms gr
                LEFT JOIN users u ON gr.user_id = u.user_id
                WHERE gr.status = 1 AND gr.visibility = 1
                  AND (
                      gr.name ILIKE $1 
                      OR gr.category ILIKE $1 
                      OR gr.description ILIKE $1
                      OR gr.tags::text ILIKE $1
                  )
                ${orderByClause}
                LIMIT $2 OFFSET $4
            `;
            values = [`%${searchTerm}%`, limit, userId, offset];
        }

        const result = await db.query(query, values);
        return result.rows;
    },

    /**
     * Get related games (by tags or category)
     */
    getRelated: async (id, limit = 8, userId = null) => {
        // First get the reference game
        const refGameResult = await db.query(
            'SELECT tags, category FROM game_rooms WHERE id = $1',
            [id]
        );

        if (refGameResult.rows.length === 0) return [];

        const refGame = refGameResult.rows[0];
        const tags = refGame.tags || [];
        const tagsJson = JSON.stringify(tags);

        const query = `
            SELECT 
                gr.id, gr.name, gr.category, gr.tags,
                gr.description, gr.cover_image, gr.ai_generated, gr.duration,
                gr.questions, gr.knowledges, gr.enemies, gr.hearts, gr.brains, gr.initial_ammo, gr.ammo_per_correct,
                gr.created_at,
                gr.game_code,
                gr.game_code,
                u.username as creator_name,
                EXISTS(SELECT 1 FROM game_favourites gf WHERE gf.game_room_id = gr.id AND gf.user_id = $5 AND gf.status = 1) as is_favourite,
                (SELECT COALESCE(AVG(r.rating), 0)::float FROM reviews r WHERE r.game_room_id = gr.id) as rating,
                (SELECT COUNT(r.rating)::int FROM reviews r WHERE r.game_room_id = gr.id) as rating_count,
                (
                   SELECT count(*) 
                   FROM jsonb_array_elements_text(gr.tags::jsonb) t1
                   WHERE t1 IN (SELECT jsonb_array_elements_text($2::jsonb))
                ) as tag_matches
            FROM game_rooms gr
            LEFT JOIN users u ON gr.user_id = u.user_id
            WHERE gr.id != $1
              AND gr.status = 1 
              AND gr.visibility = 1
              AND (
                  gr.category = $3
                  OR
                  EXISTS (
                       SELECT 1 
                       FROM jsonb_array_elements_text(gr.tags::jsonb) t1
                       WHERE t1 IN (SELECT jsonb_array_elements_text($2::jsonb))
                  )
              )
            ORDER BY tag_matches DESC, gr.created_at DESC
            LIMIT $4
        `;

        const result = await db.query(query, [id, tagsJson, refGame.category, limit, userId]);
        let games = result.rows;

        if (games.length < limit) {
            const needed = limit - games.length;
            const existingIds = games.map(g => g.id);
            existingIds.push(id); // Exclude current game

            const randomQuery = `
                SELECT 
                    gr.id, gr.name, gr.category, gr.tags,
                    gr.description, gr.cover_image, gr.ai_generated, gr.duration,
                    gr.questions, gr.knowledges, gr.enemies, gr.hearts, gr.brains, gr.initial_ammo, gr.ammo_per_correct,
                    gr.created_at,
                    gr.game_code,
                    gr.game_code,
                    u.username as creator_name,
                    EXISTS(SELECT 1 FROM game_favourites gf WHERE gf.game_room_id = gr.id AND gf.user_id = $2 AND gf.status = 1) as is_favourite,
                    (SELECT COALESCE(AVG(r.rating), 0)::float FROM reviews r WHERE r.game_room_id = gr.id) as rating,
                    (SELECT COUNT(r.rating)::int FROM reviews r WHERE r.game_room_id = gr.id) as rating_count
                FROM game_rooms gr
                LEFT JOIN users u ON gr.user_id = u.user_id
                WHERE gr.status = 1 
                  AND gr.visibility = 1
                  AND NOT (gr.id = ANY($1))
                ORDER BY RANDOM()
                LIMIT $3
            `;
            const randomResult = await db.query(randomQuery, [existingIds, userId, needed]);
            games = games.concat(randomResult.rows);
        }

        return games;
    },

    /**
     * Update a game room
     */
    update: async (id, userId, gameData) => {
        const query = `
            UPDATE game_rooms SET
                name = COALESCE($3, name),
                status = COALESCE($4, status),
                visibility = COALESCE($5, visibility),
                password = COALESCE($6, password),
                category = COALESCE($7, category),
                language = COALESCE($8, language),
                tags = COALESCE($9, tags),
                description = COALESCE($10, description),
                cover_image = COALESCE($11, cover_image),
                questions = COALESCE($12, questions),
                knowledges = COALESCE($13, knowledges),
                duration = COALESCE($14, duration),
                enemies = COALESCE($15, enemies),
                hearts = COALESCE($16, hearts),
                brains = COALESCE($17, brains),
                initial_ammo = COALESCE($18, initial_ammo),
                ammo_per_correct = COALESCE($19, ammo_per_correct),
                game_code = COALESCE($20, game_code),
                map = COALESCE($21, map),
                questions_order = $22,
                knowledges_order = $23,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
            RETURNING id
        `;

        const values = [
            id,
            userId,
            gameData.name,
            gameData.status,
            gameData.visibility,
            gameData.password,
            gameData.category,
            gameData.language,
            gameData.tags ? JSON.stringify(gameData.tags) : null,
            gameData.description,
            gameData.cover_image,
            gameData.questions ? JSON.stringify(gameData.questions) : null,
            gameData.knowledges ? JSON.stringify(gameData.knowledges) : null,
            gameData.duration,
            gameData.enemies,
            gameData.hearts,
            gameData.brains,
            gameData.initial_ammo,
            gameData.ammo_per_correct,
            gameData.game_code,
            gameData.map,
            gameData.questions_order !== undefined ? gameData.questions_order : null,
            gameData.knowledges_order !== undefined ? gameData.knowledges_order : null
        ];

        const result = await db.query(query, values);
        return result.rows[0] || null;
    },

    /**
     * Admin Update - No user_id check
     */
    updateAdmin: async (id, gameData) => {
        const query = `
            UPDATE game_rooms SET
                name = COALESCE($2, name),
                status = COALESCE($3, status),
                visibility = COALESCE($4, visibility),
                password = COALESCE($5, password),
                category = COALESCE($6, category),
                language = COALESCE($7, language),
                tags = COALESCE($8, tags),
                description = COALESCE($9, description),
                cover_image = COALESCE($10, cover_image),
                duration = COALESCE($11, duration),
                enemies = COALESCE($12, enemies),
                hearts = COALESCE($13, hearts),
                brains = COALESCE($14, brains),
                initial_ammo = COALESCE($15, initial_ammo),
                ammo_per_correct = COALESCE($16, ammo_per_correct),
                game_code = COALESCE($17, game_code),
                map = COALESCE($18, map),
                questions = COALESCE($19, questions),
                knowledges = COALESCE($20, knowledges),
                user_id = COALESCE($21, user_id),
                questions_order = $22,
                knowledges_order = $23,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;

        const values = [
            id,
            gameData.name,
            gameData.status,
            gameData.visibility,
            gameData.password,
            gameData.category,
            gameData.language,
            gameData.tags ? JSON.stringify(gameData.tags) : null,
            gameData.description,
            gameData.cover_image,
            gameData.duration,
            gameData.enemies,
            gameData.hearts,
            gameData.brains,
            gameData.initial_ammo,
            gameData.ammo_per_correct,
            gameData.game_code,
            gameData.map,
            gameData.questions ? JSON.stringify(gameData.questions) : null,
            gameData.knowledges ? JSON.stringify(gameData.knowledges) : null,
            gameData.user_id,
            gameData.questions_order !== undefined ? gameData.questions_order : null,
            gameData.knowledges_order !== undefined ? gameData.knowledges_order : null
        ];

        const result = await db.query(query, values);
        return result.rows[0] || null;
    },

    /**
     * Soft delete a game room (set status = 3)
     */
    delete: async (id, userId) => {
        const query = `
            UPDATE game_rooms 
            SET status = 3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
            RETURNING id
        `;
        const result = await db.query(query, [id, userId]);
        return result.rows[0] || null;
    },

    /**
     * Get recent games for homepage
     */
    getRecent: async (limit = 10) => {
        const query = `
            SELECT 
                gr.id, gr.name, gr.category, gr.tags,
                gr.cover_image, gr.ai_generated, gr.duration, gr.questions,
                u.username as creator_name
            FROM game_rooms gr
            LEFT JOIN users u ON gr.user_id = u.user_id
            WHERE gr.status = 1 AND (gr.visibility = 1 OR gr.visibility = 3)
            ORDER BY gr.created_at DESC
            LIMIT $1
        `;
        const result = await db.query(query, [limit]);
        return result.rows;
    },

    /**
     * Get trending games (most played - placeholder logic)
     */
    getTrending: async (limit = 10) => {
        const query = `
            SELECT 
                gr.id, gr.name, gr.category, gr.tags,
                gr.cover_image, gr.ai_generated, gr.duration, gr.questions,
                u.username as creator_name
            FROM game_rooms gr
            LEFT JOIN users u ON gr.user_id = u.user_id
            WHERE gr.status = 1 AND (gr.visibility = 1 OR gr.visibility = 3)
            ORDER BY gr.updated_at DESC
            LIMIT $1
        `;
        const result = await db.query(query, [limit]);
        return result.rows;
    },

    /**
     * Unlock a game for a user
     */
    unlockGame: async (userId, gameId) => {
        const query = `
            INSERT INTO game_unlocked (user_id, game_room_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, game_room_id) DO NOTHING
        `;
        await db.query(query, [userId, gameId]);
    },

    /**
     * Revoke access for all users to a game (used when password changes)
     */
    revokeAllAccess: async (gameId) => {
        const query = `DELETE FROM game_unlocked WHERE game_room_id = $1`;
        await db.query(query, [gameId]);
    },

    /**
     * Verify game password
     */
    verifyPassword: async (id, password) => {
        const query = `
            SELECT id FROM game_rooms 
            WHERE id = $1 AND password = $2
        `;
        const result = await db.query(query, [id, password]);
        return !!result.rows[0];
    },

    /**
     * Get ALL games for Admin
     */
    getAllAdmin: async (filters = {}) => {
        let query = `
            SELECT 
                gr.id, gr.name, gr.status, gr.visibility, gr.category, 
                gr.tags, gr.cover_image, gr.created_at, gr.updated_at, gr.game_code,
                u.username as creator_name
            FROM game_rooms gr
            LEFT JOIN users u ON gr.user_id = u.user_id
        `;

        const conditions = [];
        const values = [];

        if (filters.role) {
            conditions.push(`u.role = $${values.length + 1}`);
            values.push(filters.role);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY gr.created_at DESC';

        const result = await db.query(query, values);
        return result.rows;
    }
};

module.exports = gameRoomModel;
