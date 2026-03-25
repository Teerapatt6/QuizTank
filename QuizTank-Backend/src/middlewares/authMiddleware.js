const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึง (No Token)" });
  }

  try {
    const bearer = token.split(' ');
    const tokenValue = bearer[1] || token;

    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

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

const optionalAuth = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return next();
  }

  try {
    const bearer = token.split(' ');
    const tokenValue = bearer[1] || token;

    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.id);
    if (user && user.status === 2) {
      return res.status(401).json({ error: "บัญชีของคุณถูกระงับการใช้งาน" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    next();
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || (req.user.role && req.user.role.toUpperCase() !== 'ADMIN')) {
    return res.status(403).json({ error: "Require Admin Privilege" });
  }
  next();
};

module.exports = { verifyToken, optionalAuth, verifyAdmin };