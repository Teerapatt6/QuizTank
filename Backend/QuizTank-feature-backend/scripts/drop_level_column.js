require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function run() {
    try {
        console.log('Dropping level column from users table...');
        await pool.query('ALTER TABLE users DROP COLUMN IF EXISTS level');
        console.log('Successfully dropped level column');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

run();
