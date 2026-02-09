const pool = require('../src/config/db');
const fs = require('fs');
const path = require('path');

const run = async () => {
    try {
        const sqlPath = path.join(__dirname, '../migrations/add_ai_generated_column.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Running migration...');
        await pool.query(sql);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
};

run();
