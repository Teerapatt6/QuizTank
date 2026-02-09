const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 1. กลุ่ม Register
router.post('/register', authController.register);          // กรอกข้อมูล + ส่ง OTP
router.post('/verify-email', authController.verifyEmail);   // ยืนยัน OTP เพื่อเปิดใช้งาน Account

// 2. กลุ่ม Login
router.post('/login', authController.login);                // เช็ค Pass + ส่ง OTP
router.post('/login-verify', authController.verifyLoginOTP); // ยืนยัน OTP เพื่อรับ Token
router.post('/login-2fa-verify', authController.login2FAVerify); // ยืนยัน TOTP 2FA

const { verifyToken } = require('../middlewares/authMiddleware'); // Verify path

// 3. Security Settings (Protected)
router.post('/change-password', verifyToken, authController.changePassword);
router.post('/setup-2fa', verifyToken, authController.setup2FA);
router.post('/verify-2fa', verifyToken, authController.verify2FASetup);
router.post('/disable-2fa', verifyToken, authController.disable2FA);

module.exports = router;