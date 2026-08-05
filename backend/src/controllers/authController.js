// TẦNG NGHIỆP VỤ - Authentication & CMS User Management
const jwt = require('jsonwebtoken');
const { db } = require('../config/dbStore');
const { JWT_SECRET } = require('../middleware/authGuard');
const { logActivity } = require('../middleware/auditLogger');

exports.login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!' });
  }

  const user = db.users.find(u => u.username === username);
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  logActivity(user.full_name, 'LOGIN', 'USER', user.id, 'Đã đăng nhập thành công hệ thống CMS');

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      email: user.email
    },
    message: 'Đăng nhập CMS thành công!'
  });
};

exports.getAuditLogs = (req, res) => {
  res.json({ success: true, data: db.audit_logs });
};
