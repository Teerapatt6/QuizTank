const db = require('../config/db');

const gameReportModel = {
    create: async (userId, gameId, reason) => {
        const query = `
            INSERT INTO game_reports (user_id, game_room_id, reason)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await db.query(query, [userId, gameId, reason]);
        return result.rows[0];
    },

    checkExisting: async (userId, gameId) => {
        const query = `
            SELECT 1 FROM game_reports 
            WHERE user_id = $1 AND game_room_id = $2
        `;
        const result = await db.query(query, [userId, gameId]);
        return result.rows.length > 0;
    },

    getAll: async () => {
        const query = `
            SELECT r.*, u.username as reporter_name, g.name as game_name
            FROM game_reports r
            JOIN users u ON r.user_id = u.user_id
            JOIN game_rooms g ON r.game_room_id = g.id
            ORDER BY r.created_at DESC
        `;
        const result = await db.query(query);
        return result.rows;
    },

    getById: async (id) => {
        const query = `
            SELECT r.*, u.username as reporter_name, g.name as game_name
            FROM game_reports r
            JOIN users u ON r.user_id = u.user_id
            JOIN game_rooms g ON r.game_room_id = g.id
            WHERE r.id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    update: async (id, data) => {
        const query = `
            UPDATE game_reports 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await db.query(query, [data.status, id]);
        return result.rows[0];
    }
};

module.exports = gameReportModel;
