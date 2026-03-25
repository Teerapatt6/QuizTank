require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const adminEmail = 'admin@quiztank.local';
    const adminUsername = 'admin';
    const password = 'password123';

    // Check if admin exists
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    if (res.rows.length > 0) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role, status, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [adminUsername, adminEmail, hashedPassword, 'System Administrator', 'admin', 1, true]
    );

    console.log('Admin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
}

createAdmin();
