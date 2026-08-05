// TẦNG BẢO MẬT & MIDDLEWARE - Auth Guard & Phân quyền (JWT & RBAC)
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'portal_thcs_super_secret_key_2026';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Yêu cầu Auth Guard: Chưa cung cấp Token xác thực!' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ!' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token đã hết hạn hoặc không hợp lệ!' });
  }
}

function checkRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng!' });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Từ chối truy cập: Bạn không đủ thẩm quyền thực hiện thao tác này!' });
    }
    next();
  };
}

module.exports = {
  JWT_SECRET,
  verifyToken,
  checkRole
};
