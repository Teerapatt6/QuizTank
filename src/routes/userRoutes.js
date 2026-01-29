const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route เดิม
router.get('/profile/:username', userController.getUserProfile);

// --- Routes ใหม่สำหรับ User Settings ---

// 1. แก้ไขโปรไฟล์ทั่วไป
router.put(
    '/profile', 
    authMiddleware.verifyToken, 
    userController.updateProfile
);

// 2. แก้ไขความปลอดภัย (Username/Email/Password)
router.put(
    '/security', 
    authMiddleware.verifyToken, 
    userController.updateSecurity
);

router.post(
    '/2fa/toggle', 
    authMiddleware.verifyToken, 
    userController.toggle2FA
);

module.exports = router;