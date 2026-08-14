// TẦNG NGHIỆP VỤ - Authentication, Account Registration & User Management
const jwt = require('jsonwebtoken');
const { db, saveData } = require('../config/dbStore');
const { JWT_SECRET } = require('../middleware/authGuard');
const { logActivity } = require('../middleware/auditLogger');

// 1. ĐĂNG NHẬP (Check status PENDING_APPROVAL / APPROVED)
exports.login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!' });
  }

  const user = db.users.find(u => u.username === username);
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' });
  }

  // Kiểm tra phê duyệt tài khoản
  if (user.status === 'PENDING_APPROVAL') {
    return res.status(403).json({
      success: false,
      message: 'Tài khoản của bạn đang chờ Ban Giám Hiệu / Admin phê duyệt cấp phép trước khi đăng nhập!'
    });
  }

  if (user.status === 'REJECTED') {
    return res.status(403).json({
      success: false,
      message: 'Tài khoản của bạn đã bị từ chối cấp quyền truy cập.'
    });
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
      email: user.email,
      status: user.status
    },
    message: 'Đăng nhập CMS thành công!'
  });
};

// 2. ĐĂNG KÝ TÀI KHOẢN MỚI (Tự động gửi về Admin chờ duyệt)
exports.register = (req, res) => {
  const { username, password, full_name, email, role } = req.body;

  if (!username || !password || !full_name) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ Tên đăng nhập, Mật khẩu và Họ tên!' });
  }

  const existing = db.users.find(u => u.username === username);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Tên đăng nhập này đã được sử dụng!' });
  }

  const newUser = {
    id: db.users.length + 1,
    username,
    password_hash: password,
    full_name,
    email: email || '',
    role: role || 'TEACHER',
    status: 'PENDING_APPROVAL',
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);
  saveData();

  logActivity(full_name, 'REGISTER_REQUEST', 'USER', newUser.id, `Tài khoản mới đăng ký chờ duyệt: ${username}`);

  res.status(201).json({
    success: true,
    message: 'Đăng ký tài khoản thành công! Yêu cầu của bạn đã được gửi tới Admin / Ban Giám Hiệu để phê duyệt.'
  });
};

// 3. ĐỔI MẬT KHẨU TÀI KHOẢN (Đang đăng nhập)
exports.changePassword = (req, res) => {
  const { old_password, new_password } = req.body;
  const userId = req.user.id;

  if (!old_password || !new_password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới!' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
  }

  if (user.password_hash !== old_password) {
    return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng!' });
  }

  user.password_hash = new_password;
  saveData();

  logActivity(user.full_name, 'CHANGE_PASSWORD', 'USER', user.id, 'Đã cập nhật mật khẩu mới thành công');

  res.json({ success: true, message: 'Đổi mật khẩu thành công! Vui lòng lưu nhớ mật khẩu mới.' });
};

// 4. DANH SÁCH TÀI KHOẢN ĐĂNG KÝ CHỜ DUYỆT (Dành cho Admin)
exports.getPendingUsers = (req, res) => {
  const pendingList = db.users.filter(u => u.status === 'PENDING_APPROVAL');
  res.json({ success: true, data: pendingList });
};

// 5. ADMIN DUYỆT / TỪ CHỐI TÀI KHOẢN
exports.approveUser = (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'APPROVE' hoặc 'REJECT'

  const user = db.users.find(u => u.id === parseInt(id));
  if (!user) {
    return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại!' });
  }

  if (action === 'APPROVE') {
    user.status = 'APPROVED';
    logActivity(req.user.full_name, 'APPROVE_USER', 'USER', user.id, `Đã phê duyệt cấp tài khoản cho: ${user.username}`);
    saveData();
    return res.json({ success: true, message: `Đã duyệt cấp quyền thành công cho tài khoản ${user.username}!` });
  } else if (action === 'REJECT') {
    user.status = 'REJECTED';
    logActivity(req.user.full_name, 'REJECT_USER', 'USER', user.id, `Đã từ chối cấp tài khoản cho: ${user.username}`);
    saveData();
    return res.json({ success: true, message: `Đã từ chối tài khoản ${user.username}.` });
  }

  res.status(400).json({ success: false, message: 'Hành động không hợp lệ!' });
};

// 6. NHẬT KÝ HỆ THỐNG
exports.getAuditLogs = (req, res) => {
  res.json({ success: true, data: db.audit_logs });
};
