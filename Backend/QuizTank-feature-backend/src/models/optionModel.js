const db = require('../config/db');

module.exports = {
    getAll: async () => {
        const sql = 'SELECT * FROM options';
        const { rows } = await db.query(sql);
        return rows;
    },

    getByKey: async (key) => {
        const sql = 'SELECT * FROM options WHERE key = $1';
        const { rows } = await db.query(sql, [key]);
        return rows[0];
    },

    update: async (key, value) => {
        const sql = `
            INSERT INTO options (key, value)
            VALUES ($1, $2)
            ON CONFLICT (key) DO UPDATE
            SET value = EXCLUDED.value
            RETURNING *
        `;
        const { rows } = await db.query(sql, [key, JSON.stringify(value)]);
        return rows[0];
    },

    delete: async (key) => {
        const sql = 'DELETE FROM options WHERE key = $1';
        await db.query(sql, [key]);
        return true;
    }
};
