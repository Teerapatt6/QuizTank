const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');

// --- 1. General Profile Settings ---
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, biography, profile_pic_url } = req.body;

        const updatedUser = await userModel.updateProfile(userId, {
            full_name,
            biography,
            profile_pic_url
        });

        if (!updatedUser) {
            return res.status(400).json({ message: "ไม่มีข้อมูลเปลี่ยนแปลง" });
        }

        res.json({
            success: true,
            message: "อัปเดตโปรไฟล์สำเร็จ",
            user: updatedUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error Update Profile" });
    }
};

// --- 2. Critical Account Settings ---
const updateSecurity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email, current_password, new_password } = req.body;

        // 1. ดึงข้อมูล User ปัจจุบัน
        const currentUser = await userModel.getUserSecurityData(userId);
        if (!currentUser) return res.status(404).json({ error: "User not found" });

        const updatePayload = {};

        // 2. เช็ค Username
        if (username && username !== currentUser.username) {
            const isTaken = await userModel.checkAvailabilityExcludingSelf('username', username, userId);
            if (isTaken) return res.status(400).json({ error: "Username นี้ถูกใช้งานแล้ว" });
            updatePayload.username = username;
        }

        // 3. เช็ค Email
        if (email && email !== currentUser.email) {
            const isTaken = await userModel.checkAvailabilityExcludingSelf('email', email, userId);
            if (isTaken) return res.status(400).json({ error: "Email นี้ถูกใช้งานแล้ว" });
            updatePayload.email = email;
            // หมายเหตุ: ใน Model เราสั่งให้ is_verified = false อัตโนมัติแล้ว
        }

        // 4. เช็ค Password
        if (new_password) {
            if (!current_password) {
                return res.status(400).json({ error: "กรุณาระบุรหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยนแปลง" });
            }

            const isMatch = await bcrypt.compare(current_password, currentUser.password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
            }

            const salt = await bcrypt.genSalt(10);
            updatePayload.password_hash = await bcrypt.hash(new_password, salt);
        }

        // 5. สั่ง Update
        if (Object.keys(updatePayload).length > 0) {
            await userModel.updateSecurity(userId, updatePayload);

            // ถ้ามีการเปลี่ยนอีเมล อาจจะแจ้งเตือน User หน่อย
            let msg = "อัปเดตการตั้งค่าความปลอดภัยสำเร็จ";
            if (updatePayload.email) {
                msg += " (กรุณายืนยันอีเมลใหม่ก่อนเข้าใช้งานครั้งถัดไป)";
            }

            return res.json({ success: true, message: msg });
        } else {
            return res.json({ success: true, message: "ไม่มีข้อมูลเปลี่ยนแปลง" });
        }

    } catch (error) {
        console.error("Security Update Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const toggle2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const { enable, password } = req.body; // enable: true/false

        // 1. ถ้าจะ "ปิด" (Disable) ต้องบังคับเช็ค Password เสมอ กันคนแอบมาปิด
        if (enable === false) {
            if (!password) {
                return res.status(400).json({ error: "กรุณากรอกรหัสผ่านเพื่อยืนยันการปิดใช้งาน 2FA" });
            }

            const currentUser = await userModel.getUserSecurityData(userId);
            const isMatch = await bcrypt.compare(password, currentUser.password_hash);

            if (!isMatch) {
                return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง ไม่สามารถปิด 2FA ได้" });
            }
        }

        // 2. อัปเดตสถานะ
        await userModel.toggleTwoFactorStatus(userId, enable);

        const statusMsg = enable ? "เปิด" : "ปิด";
        res.json({
            success: true,
            message: `${statusMsg}ใช้งานการยืนยันตัวตน 2 ชั้นเรียบร้อยแล้ว`
        });

    } catch (error) {
        console.error("Toggle 2FA Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await userModel.findByUsername(username);

        if (!user || user.status === 2 || !user.is_verified) {
            return res.status(404).json({ error: "User not found" });
        }

        // Return only safe data
        const { password_hash, two_factor_secret, ...safeUser } = user;

        res.json({
            success: true,
            user: safeUser
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Convert buffer to data URI
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: process.env.CLOUDINARY_FOLDER || "quiztank/avatars",
            public_id: `user_${req.user.id}_avatar`,
            overwrite: true,
            transformation: [{ width: 200, height: 200, crop: "fill" }]
        });

        const userId = req.user.id;
        const profile_pic_url = result.secure_url;

        await userModel.updateProfile(userId, { profile_pic_url });

        res.json({
            success: true,
            message: "Avatar updated successfully",
            url: profile_pic_url
        });

    } catch (error) {
        console.error("Upload Avatar Error:", error);
        res.status(500).json({ error: "Upload failed" });
    }
};

module.exports = {
    updateProfile,
    updateSecurity,
    toggle2FA,
    getUserProfile,
    uploadAvatar
};