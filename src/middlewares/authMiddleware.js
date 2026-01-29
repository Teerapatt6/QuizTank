const jwt = require('jsonwebtoken');

// 1. Middleware สำหรับ Route ที่ "ต้อง" Login เท่านั้น (Strict)
// (อันเดิมของคุณ)
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึง (No Token)" });
  }

  try {
    const bearer = token.split(' ');
    const tokenValue = bearer[1] || token;

    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token ไม่ถูกต้อง หรือหมดอายุ" });
  }
};

// 2. Middleware สำหรับ Route ที่ "Login หรือไม่ก็ได้" (Optional)
// (อันที่เพิ่มใหม่)
const optionalAuth = (req, res, next) => {
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

// 3. Export เป็น Object รวม (สำคัญมาก! ต้องเปลี่ยนบรรทัดนี้จากเดิม)
module.exports = { verifyToken, optionalAuth };