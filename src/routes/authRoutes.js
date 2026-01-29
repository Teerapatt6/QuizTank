const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 1. กลุ่ม Register
router.post('/register', authController.register);          // กรอกข้อมูล + ส่ง OTP
router.post('/verify-email', authController.verifyEmail);   // ยืนยัน OTP เพื่อเปิดใช้งาน Account

// 2. กลุ่ม Login
router.post('/login', authController.login);                // เช็ค Pass + ส่ง OTP
router.post('/login-verify', authController.verifyLoginOTP); // ยืนยัน OTP เพื่อรับ Token

module.exports = router;