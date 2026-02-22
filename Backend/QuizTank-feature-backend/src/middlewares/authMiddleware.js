const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// 1. Middleware สำหรับ Route ที่ "ต้อง" Login เท่านั้น (Strict)
// (อันเดิมของคุณ)
const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึง (No Token)" });
  }

  try {
    const bearer = token.split(' ');
    const tokenValue = bearer[1] || token;

    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    // 🔥 เพิ่มการเช็ค Status จาก DB เพื่อรองรับการแบน User ทันที
    const user = await UserModel.findById(decoded.id);
    if (!user || user.status === 2) {
      return res.status(401).json({ error: "บัญชีของคุณถูกระงับการใช้งาน" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token ไม่ถูกต้อง หรือหมดอายุ" });
  }
};

// 2. Middleware สำหรับ Route ที่ "Login หรือไม่ก็ได้" (Optional)
// (อันที่เพิ่มใหม่)
const optionalAuth = async (req, res, next) => {
  const token = req.headers['authorization'];

  // กรณี: ไม่มี Token ส่งมาเลย -> ให้ผ่านไปได้เลย (แต่ req.user จะเป็น undefined)
  if (!token) {
    return next();
  }

  try {
    // กรณี: มี Token ส่งมา -> ต้องตรวจสอบความถูกต้อง
    const bearer = token.split(' ');
    const tokenValue = bearer[1] || token;

    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    // 🔥 เช็ค Status แม้จะเป็น Optional
    const user = await UserModel.findById(decoded.id);
    if (user && user.status === 2) {
      // ถ้าถูกแบน ให้ถือว่าเป็น Guest (หรือไม่ให้เข้าเลย?)
      // ในระบบส่วนใหญ่ ถ้าโดนแบน ไม่ควรให้เข้าถึงข้อมูลส่วนตัวใดๆ แม้จะเป็น optional
      // ดังนั้นเราจะปล่อย req.user เป็น undefined หรือแจ้ง 401
      return res.status(401).json({ error: "บัญชีของคุณถูกระงับการใช้งาน" });
    }

    req.user = decoded; // ถ้า Token ถูก ก็ฝัง req.user ให้ Controller ใช้
    next();
  } catch (err) {
    // กรณี: ส่ง Token มาแต่ผิด หรือ หมดอายุ
    // แนะนำให้ return 401 เพื่อให้ Frontend รู้ตัวว่า Token ที่ถืออยู่ใช้ไม่ได้แล้ว
    return res.status(401).json({ error: "Token ไม่ถูกต้อง หรือหมดอายุ" });

    // หมายเหตุ: ถ้าคุณอยากให้แอพไม่แจ้ง Error เลยแม้ Token ผิด (ถือว่าเป็น Guest ไปเลย) 
    // ให้เปลี่ยนบรรทัดบนเป็น: next(); แทนครับ
  }
};

const verifyAdmin = (req, res, next) => {
  // ต้องผ่าน verifyToken มาก่อน เพื่อให้มี req.user
  if (!req.user || (req.user.role && req.user.role.toUpperCase() !== 'ADMIN')) {
    return res.status(403).json({ error: "Require Admin Privilege" });
  }
  next();
};

// 3. Export เป็น Object รวม (สำคัญมาก! ต้องเปลี่ยนบรรทัดนี้จากเดิม)
module.exports = { verifyToken, optionalAuth, verifyAdmin };