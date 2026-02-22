const db = require('../config/db');

const MapModel = {
    /**
     * Get all maps
     */
    getAll: async () => {
        const query = `
            SELECT * FROM maps
            ORDER BY created_at DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    /**
     * Get map by ID
     */
    getById: async (id) => {
        const query = `
            SELECT * FROM maps
            WHERE map_id = $1
        `;
        const { rows } = await db.query(query, [id]); // id param is passed from controller, which gets it from route /:id
        return rows[0];
    },

    /**
     * Create a new map
     */
    create: async (mapData) => {
        const query = `
            INSERT INTO maps (
                name, description, status, image_url
            ) VALUES (
                $1, $2, $3, $4
            )
            RETURNING *
        `;
        const values = [
            mapData.name,
            mapData.description || '',
            mapData.status || 1, // Default to 1 (active)
            mapData.image_url || null
        ];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    /**
     * Update a map
     */
    update: async (id, mapData) => {
        const query = `
            UPDATE maps
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                status = COALESCE($3, status),
                image_url = COALESCE($4, image_url),
                updated_at = NOW()
            WHERE map_id = $5
            RETURNING *
        `;
        const values = [
            mapData.name,
            mapData.description,
            mapData.status,
            mapData.image_url,
            id
        ];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    /**
     * Delete a map
     */
    delete: async (id) => {
        const query = `
            DELETE FROM maps
            WHERE map_id = $1
            RETURNING map_id
        `;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
};

module.exports = MapModel;
