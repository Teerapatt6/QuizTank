const db = require('../config/db'); // ตรวจสอบว่า db นี้คือ pool ของ pg

module.exports = {

    // 1. เช็ค Username/Email ซ้ำ (ใช้ $1, $2 แทน ?)
    checkDuplicate: async (username, email) => {
        const sql = 'SELECT user_id FROM users WHERE username = $1 OR email = $2';
        const { rows } = await db.query(sql, [username, email]);
        return rows[0];
    },

    // 2. สร้าง User ใหม่ (รองรับ RETURNING แบบ Postgres)
    createUser: async (user) => {
        const { username, email, password_hash, role, status, full_name, biography, profile_pic_url, is_verified } = user;
        const sql = `
            INSERT INTO users (username, email, password_hash, role, xp, status, full_name, biography, profile_pic_url, is_verified)
            VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8, $9)
            RETURNING user_id, username, email, role, xp, status, full_name, biography, profile_pic_url, is_verified
        `;
        // Default: Level 1, XP 0, status 1
        const { rows } = await db.query(sql, [
            username,
            email,
            password_hash,
            role || 'USER',
            status || 1,
            full_name || null,
            biography || null,
            profile_pic_url || null,
            is_verified === undefined ? false : is_verified
        ]);
        return rows[0];
    },

    // 3. หา User ด้วย Username (ใช้ตอน Login)
    findByUsername: async (username) => {
        const sql = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await db.query(sql, [username]);
        return rows[0];
    },

    // 4. หา User ด้วย ID
    findById: async (id) => {
        const sql = 'SELECT * FROM users WHERE user_id = $1';
        const { rows } = await db.query(sql, [id]);
        return rows[0];
    },

    // 5. ดึงข้อมูล Navbar
    getNavbarInfo: async (userId) => {
        const sql = `
            SELECT user_id, username, profile_pic_url, xp, role 
            FROM users 
            WHERE user_id = $1
        `;
        const { rows } = await db.query(sql, [userId]);
        return rows[0];
    },
    // 1. ดึงข้อมูล Security ปัจจุบัน
    getUserSecurityData: async (userId) => {
        const sql = `SELECT user_id, password_hash, username, email, status FROM users WHERE user_id = $1`;
        const { rows } = await db.query(sql, [userId]);
        return rows[0];
    },

    // 2. เช็ค Username/Email ซ้ำ (ไม่นับตัวเอง)
    checkAvailabilityExcludingSelf: async (field, value, excludeUserId) => {
        if (!['username', 'email'].includes(field)) throw new Error('Invalid field check');

        const sql = `SELECT 1 FROM users WHERE ${field} = $1 AND user_id != $2`;
        const { rows } = await db.query(sql, [value, excludeUserId]);
        return rows.length > 0;
    },

    // 3. Update Profile (เหมือนเดิม)
    updateProfile: async (userId, payload) => {
        const fields = [];
        const values = [];
        let paramIdx = 1;

        if (payload.full_name !== undefined) {
            fields.push(`full_name = $${paramIdx++}`);
            values.push(payload.full_name);
        }
        if (payload.biography !== undefined) {
            fields.push(`biography = $${paramIdx++}`);
            values.push(payload.biography);
        }
        if (payload.profile_pic_url !== undefined) {
            fields.push(`profile_pic_url = $${paramIdx++}`);
            values.push(payload.profile_pic_url);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);

        if (fields.length === 1) return null;

        const sql = `
            UPDATE users 
            SET ${fields.join(', ')} 
            WHERE user_id = $${paramIdx}
            RETURNING user_id, username, full_name, biography, profile_pic_url, email
        `;
        values.push(userId);

        const { rows } = await db.query(sql, values);
        return rows[0];
    },

    // 4. Update Security (ตัดเรื่อง 2FA ออก เน้นแค่ User/Pass/Email)
    updateSecurity: async (userId, payload) => {
        const fields = [];
        const values = [];
        let paramIdx = 1;

        if (payload.username) {
            fields.push(`username = $${paramIdx++}`);
            values.push(payload.username);
        }
        if (payload.email) {
            fields.push(`email = $${paramIdx++}`);
            values.push(payload.email);

            // สำคัญ: ถ้ามีการเปลี่ยนอีเมล ต้องปรับให้เป็น Unverified ก่อน
            // เพื่อบังคับให้ User ไปยืนยันตัวตนใหม่ในครั้งถัดไป
            fields.push(`is_verified = FALSE`);
        }
        if (payload.password_hash) {
            fields.push(`password_hash = $${paramIdx++}`);
            values.push(payload.password_hash);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);

        const sql = `
            UPDATE users 
            SET ${fields.join(', ')} 
            WHERE user_id = $${paramIdx}
        `;
        values.push(userId);

        await db.query(sql, values);
        return true;
    },
    updatePassword: async (userId, hashedPassword) => {
        const sql = `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`;
        await db.query(sql, [hashedPassword, userId]);
        return true;
    },

    // Save TOTP secret (temporarily or permanently)
    saveTwoFactorSecret: async (userId, secret) => {
        // Assuming column exists: two_factor_secret
        // If not, this will crash, but per instructions "Update Backend logic (or DB, if required)"
        // I'm assuming I can use this column.
        const sql = `UPDATE users SET two_factor_secret = $1 WHERE user_id = $2`;
        await db.query(sql, [secret, userId]);
        return true;
    },

    getTwoFactorSecret: async (userId) => {
        const sql = `SELECT two_factor_secret FROM users WHERE user_id = $1`;
        const { rows } = await db.query(sql, [userId]);
        return rows[0]?.two_factor_secret;
    },

    // ฟังก์ชันสลับสถานะ 2FA (เปิด/ปิด)
    toggleTwoFactorStatus: async (userId, isEnabled) => {
        const sql = `
            UPDATE users 
            SET is_2fa_enabled = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = $2
        `;
        await db.query(sql, [isEnabled, userId]);
        return true;
    },
    // 5. หา User ด้วย Email (ใช้ตอน Login Verify)
    findByEmail: async (email) => {
        const sql = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(sql, [email]);
        return rows[0];
    },

    // 6. สร้าง OTP และบันทึกลง DB
    createOTP: async (email) => {
        // สร้างเลขสุ่ม 6 หลัก
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // ลบ OTP เก่าของอีเมลนี้ทิ้งก่อน (ถ้ามี) เพื่อไม่ให้มีขยะค้าง
        await db.query('DELETE FROM verification_codes WHERE email = $1', [email]);

        // บันทึกใหม่ (กำหนดหมดอายุใน 5 นาที)
        const sql = `
            INSERT INTO verification_codes (email, otp_code, expires_at)
            VALUES ($1, $2, NOW() + INTERVAL '5 minutes')
        `;
        await db.query(sql, [email, otp]);
        return otp; // ส่งเลขกลับไปให้ Controller (เพื่อเอาไปส่งเมล)
    },

    // 7. ตรวจสอบ OTP
    verifyOTP: async (email, code) => {
        const sql = `
            SELECT id FROM verification_codes 
            WHERE email = $1 AND otp_code = $2 AND expires_at > NOW()
        `;
        const { rows } = await db.query(sql, [email, code]);

        if (rows.length > 0) {
            // ถ้าถูก ต้องลบทิ้งทันที (One-Time Use)
            await db.query('DELETE FROM verification_codes WHERE id = $1', [rows[0].id]);
            return true;
        }
        return false;
    },

    // 8. อัปเดต User ว่า Verify Email แล้ว
    markUserVerified: async (email) => {
        await db.query('UPDATE users SET is_verified = TRUE WHERE email = $1', [email]);
    },

    // 9. Get All Users (Admin)
    getAllUsers: async () => {
        const sql = 'SELECT user_id, username, email, role, xp, is_verified, status, created_at FROM users ORDER BY created_at DESC';
        const { rows } = await db.query(sql);
        return rows;
    },

    // 10. Admin Update User
    adminUpdateUser: async (userId, data) => {
        const fields = [];
        const values = [];
        let paramIdx = 1;

        const allowedFields = ['username', 'email', 'role', 'status', 'xp', 'is_verified', 'password_hash', 'full_name', 'biography', 'profile_pic_url'];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = $${paramIdx++}`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) return null;

        fields.push(`updated_at = CURRENT_TIMESTAMP`);

        const sql = `
            UPDATE users 
            SET ${fields.join(', ')} 
            WHERE user_id = $${paramIdx}
            RETURNING user_id, username, email, role, status, xp, is_verified
        `;
        values.push(userId);

        const { rows } = await db.query(sql, values);
        return rows[0];
    }
};