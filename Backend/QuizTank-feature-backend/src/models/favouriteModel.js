const db = require('../config/db');

const favouriteModel = {
    /**
     * Get favourite status for a user and game
     */
    checkStatus: async (userId, gameId) => {
        const query = `
            SELECT status FROM game_favourites 
            WHERE user_id = $1 AND game_room_id = $2
        `;
        const result = await db.query(query, [userId, gameId]);
        return result.rows[0] ? result.rows[0].status : 0; // 0 = Not found
    },

    /**
     * Add to favourites (Create or Update to Active)
     */
    add: async (userId, gameId) => {
        // Check if exists
        const checkQuery = `SELECT id FROM game_favourites WHERE user_id = $1 AND game_room_id = $2`;
        const checkResult = await db.query(checkQuery, [userId, gameId]);

        if (checkResult.rows.length === 0) {
            // Create new
            const insertQuery = `
                INSERT INTO game_favourites (user_id, game_room_id, status)
                VALUES ($1, $2, 1)
                RETURNING status
            `;
            const result = await db.query(insertQuery, [userId, gameId]);
            return result.rows[0].status;
        } else {
            // Update existing
            const updateQuery = `
                UPDATE game_favourites 
                SET status = 1, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $1 AND game_room_id = $2
                RETURNING status
            `;
            const result = await db.query(updateQuery, [userId, gameId]);
            return result.rows[0].status;
        }
    },

    /**
     * Remove from favourites (Update to Inactive)
     */
    remove: async (userId, gameId) => {
        const query = `
            UPDATE game_favourites 
            SET status = 2, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND game_room_id = $2
            RETURNING status
        `;
        const result = await db.query(query, [userId, gameId]);
        return result.rows[0] ? result.rows[0].status : 0;
    },

    /**
     * Get all active favourites for a user
     */
    getUserFavourites: async (userId, limit = 20, offset = 0, sortBy = 'newest') => {
        let orderByClause = 'ORDER BY gf.created_at DESC';
        if (sortBy === 'popularity') orderByClause = 'ORDER BY play_count DESC';
        else if (sortBy === 'rating') orderByClause = 'ORDER BY rating DESC, rating_count DESC';

        const query = `
            SELECT 
                gr.id, gr.name, gr.category, gr.tags,
                gr.description,
                gr.cover_image, gr.ai_generated, gr.duration, gr.questions,
                gr.knowledges, gr.enemies, gr.hearts, gr.brains, gr.initial_ammo, gr.ammo_per_correct,
                u.username as creator_name,
                u.full_name as creator_full_name,
                u.profile_pic_url as creator_avatar,
                gf.created_at as favorited_at,
                gr.game_code as "gameCode",
                (SELECT COALESCE(AVG(r.rating), 0)::float FROM reviews r WHERE r.game_room_id = gr.id) as rating,
                (SELECT COUNT(r.rating)::int FROM reviews r WHERE r.game_room_id = gr.id) as rating_count,
                (SELECT COUNT(*)::int FROM game_plays gp WHERE gp.game_room_id = gr.id AND (gp.status = 2 OR gp.status = 3)) as play_count
            FROM game_rooms gr
            JOIN game_favourites gf ON gr.id = gf.game_room_id
            LEFT JOIN users u ON gr.user_id = u.user_id
            WHERE gf.user_id = $1 AND gf.status = 1
              AND gr.status = 1 AND gr.visibility IN (1, 3, 4)
            ${orderByClause}
            LIMIT $2 OFFSET $3
        `;
        const result = await db.query(query, [userId, limit, offset]);
        return result.rows;
    }
};

module.exports = favouriteModel;
