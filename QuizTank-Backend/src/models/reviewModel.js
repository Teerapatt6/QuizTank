const db = require('../config/db');

const reviewModel = {
    // Check if user has played and completed the game (status 2 or 3)
    hasPlayed: async (userId, gameRoomId) => {
        const query = `
            SELECT 1 FROM game_plays
            WHERE user_id = $1 AND game_room_id = $2
            AND status IN (2, 3)
            LIMIT 1
        `;
        const result = await db.query(query, [userId, gameRoomId]);
        return result.rowCount > 0;
    },

    // Get user review
    getUserReview: async (userId, gameRoomId) => {
        const query = `
            SELECT rating FROM reviews
            WHERE user_id = $1 AND game_room_id = $2
        `;
        const result = await db.query(query, [userId, gameRoomId]);
        return result.rows[0];
    },

    // Upsert review
    upsertReview: async (userId, gameRoomId, rating) => {
        // Enforce range 1-5
        if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');

        // Check if review exists
        const checkQuery = `SELECT review_id FROM reviews WHERE user_id = $1 AND game_room_id = $2`;
        const existing = await db.query(checkQuery, [userId, gameRoomId]);

        if (existing.rowCount > 0) {
            // Update
            const updateQuery = `
                UPDATE reviews 
                SET rating = $1, created_at = CURRENT_TIMESTAMP
                WHERE review_id = $2 
                RETURNING *
            `;
            const result = await db.query(updateQuery, [rating, existing.rows[0].review_id]);
            return result.rows[0];
        } else {
            // Insert
            const insertQuery = `
                INSERT INTO reviews (user_id, game_room_id, rating) 
                VALUES ($1, $2, $3) 
                RETURNING *
            `;
            const result = await db.query(insertQuery, [userId, gameRoomId, rating]);
            return result.rows[0];
        }
    }
};

module.exports = reviewModel;
