const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const checkSchema = async () => {
    try {
        const sql = `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'maps'
        `;
        const { rows } = await pool.query(sql);
        console.log('Columns in users table:');
        rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
        process.exit(0);
    } catch (err) {
        console.error('Failed to check schema:', err);
        process.exit(1);
    }
};

checkSchema();
