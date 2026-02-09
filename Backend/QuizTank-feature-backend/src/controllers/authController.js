const UserModel = require('../models/userModel');
const emailService = require('../services/emailService'); // *ต้องสร้างไฟล์นี้
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// --- 1. Register Flow ---

// Step 1: รับข้อมูล -> สร้าง User (Verify=False) -> ส่ง OTP
exports.register = async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  try {
    // เช็ค User ซ้ำ
    const existingUser = await UserModel.checkDuplicate(username, email);
    if (existingUser) {
      return res.status(400).json({ error: "Username หรือ Email นี้ถูกใช้งานแล้ว" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // สร้าง User (ต้องแก้ Model ให้รองรับการ insert is_verified = false)
    const newUserObj = {
      username,
      email,
      password_hash: hashedPassword,
      role: 'USER',
      is_verified: false // *สำคัญ
    };

    await UserModel.createUser(newUserObj);

    // สร้าง OTP และส่ง Email
    const otp = await UserModel.createOTP(email); // *ต้องเพิ่ม method นี้ใน Model
    await emailService.sendOTP(email, otp, 'REGISTER');

    res.status(201).json({
      message: "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบ Email เพื่อนำรหัสมายืนยัน",
      email: email,
      otp: otp // DEBUG ONLY
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server Error ในการสมัครสมาชิก",
      details: err.message, // DEBUG
      stack: err.stack      // DEBUG
    });
  }
};

// Step 2: ยืนยัน OTP สมัครสมาชิก
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // ตรวจสอบ OTP
    const isValid = await UserModel.verifyOTP(email, code); // *ต้องเพิ่ม method นี้ใน Model
    if (!isValid) {
      return res.status(400).json({ error: "รหัส OTP ไม่ถูกต้องหรือหมดอายุ" });
    }

    // ปรับสถานะ User เป็น Active
    await UserModel.markUserVerified(email); // *ต้องเพิ่ม method นี้ใน Model

    res.json({ success: true, message: "ยืนยันอีเมลสำเร็จ คุณสามารถเข้าสู่ระบบได้แล้ว" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error ในการยืนยันอีเมล" });
  }
};

// --- 2. Login Flow (2FA) ---

// Step 1: Login (เช็ค User/Pass -> เช็ค 2FA -> ส่ง Token หรือ OTP)
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. ค้นหา User
    const user = await UserModel.findByUsername(username);

    if (!user) {
      return res.status(401).json({ error: "Username หรือ Password ไม่ถูกต้อง" });
    }

    // 2. ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Username หรือ Password ไม่ถูกต้อง" });
    }

    // 3. เช็คว่ายืนยันอีเมลตอนสมัครรึยัง (สำคัญมาก)
    if (!user.is_verified) {
      return res.status(403).json({ error: "กรุณายืนยันอีเมลก่อนเข้าใช้งาน" });
    }

    // 3.5 เช็คสถานะการใช้งาน
    if (user.status === 2) {
      return res.status(403).json({ error: "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ" });
    }

    // 4. เช็ค Setting 2FA ของ User
    // กรณี: เปิด 2FA ไว้ -> ส่ง OTP และยังไม่ให้ Token
    if (user.is_2fa_enabled) {
      // Change to TOTP flow (don't send email)
      return res.json({
        require2FA: true,
        userId: user.user_id,
        username: user.username,
        message: "Please enter code from Authenticator App"
      });
    }

    // กรณี: ปิด 2FA ไว้ -> ข้าม OTP แล้วแจก Token เลย
    const token = jwt.sign(
      {
        id: user.user_id, // ใช้ id หรือ user_id ให้ตรงกับที่ใช้ในโปรเจกต์
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      token: token,
      user: {
        id: user.user_id,
        username: user.username,
        role: user.role,
        xp: user.xp,
        profile_pic_url: user.profile_pic_url
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error ในการเข้าสู่ระบบ" });
  }
};

// Step 2: ยืนยัน OTP Login -> รับ Token
exports.verifyLoginOTP = async (req, res) => {
  try {
    const { email, code } = req.body;

    // ตรวจสอบ OTP
    const isValid = await UserModel.verifyOTP(email, code);
    if (!isValid) {
      return res.status(400).json({ error: "รหัส OTP ไม่ถูกต้องหรือหมดอายุ" });
    }

    // ดึงข้อมูล User อีกครั้งเพื่อสร้าง Token
    // (ต้องระวัง: user อาจจะ login ด้วย username แต่ตอน verify เราใช้ email)
    const user = await UserModel.findByEmail(email);

    if (!user || user.status === 2) {
      return res.status(403).json({ error: "บัญชีของคุณถูกระงับการใช้งาน" });
    }

    // สร้าง Token (จุดเดียวที่จะแจก Token)
    const token = jwt.sign(
      {
        id: user.user_id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      token: token,
      user: {
        id: user.user_id,
        username: user.username,
        role: user.role,
        xp: user.xp
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error ในการยืนยันรหัสเข้าสู่ระบบ" });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await UserModel.getUserSecurityData(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: "Incorrect current password" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserModel.updatePassword(userId, hashedPassword);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

// Setup 2FA (Generate Secret & QR)
exports.setup2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const secret = speakeasy.generateSecret({ name: `QuizTank (${req.user.username})` });

    // Save temporary secret (or permanent, assuming user will verify)
    await UserModel.saveTwoFactorSecret(userId, secret.base32);

    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ error: "Error generating QR Code" });
      res.json({ secret: secret.base32, qrCode: data_url });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to setup 2FA" });
  }
};

// Verify 2FA Setup
exports.verify2FASetup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    const secret = await UserModel.getTwoFactorSecret(userId);
    if (!secret) return res.status(400).json({ error: "2FA not initialized" });

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
    });

    if (verified) {
      await UserModel.toggleTwoFactorStatus(userId, true);
      res.json({ success: true, message: "2FA Enabled successfully" });
    } else {
      res.status(400).json({ error: "Invalid verification code" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify 2FA" });
  }
};

// Disable 2FA
exports.disable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    // Optionally verify password before disabling for extra security
    await UserModel.toggleTwoFactorStatus(userId, false);
    res.json({ success: true, message: "2FA Disabled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to disable 2FA" });
  }
};

exports.login2FAVerify = async (req, res) => {
  try {
    const { userId, token } = req.body;

    const secret = await UserModel.getTwoFactorSecret(userId);
    if (!secret) return res.status(400).json({ error: "2FA not configured" });

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
    });

    if (!verified) return res.status(400).json({ error: "Invalid Code" });

    const user = await UserModel.getUserSecurityData(userId);

    if (!user || user.status === 2) {
      return res.status(403).json({ error: "บัญชีของคุณถูกระงับการใช้งาน" });
    }

    const jwtToken = jwt.sign(
      { id: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: "Login Successful",
      token: jwtToken,
      user: {
        id: user.user_id,
        username: user.username,
        role: user.role,
        xp: user.xp,
        profile_pic_url: user.profile_pic_url
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Verification Failed" });
  }
};