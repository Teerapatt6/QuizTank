const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function setupOptions() {
    try {
        await pool.query('CREATE TABLE IF NOT EXISTS options (key TEXT PRIMARY KEY, value JSONB);');
        console.log('Table "options" created or already exists.');

        const categories = ["Math", "Science", "Computer Science", "History"];
        const languages = ["English", "Thai", "Spanish"];

        await pool.query(
            "INSERT INTO options (key, value) VALUES ('categories', $1), ('languages', $2) ON CONFLICT (key) DO NOTHING;",
            [JSON.stringify(categories), JSON.stringify(languages)]
        );
        console.log('Seeded "options" table.');
    } catch (err) {
        console.error('Error setting up options table:', err);
    } finally {
        await pool.end();
    }
}

setupOptions();
