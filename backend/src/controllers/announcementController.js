// TẦNG NGHIỆP VỤ - Announcement & Event Schedule Management
const { db, saveData } = require('../config/dbStore');
const { logActivity } = require('../middleware/auditLogger');

exports.getAnnouncements = (req, res) => {
  res.json({ success: true, data: db.announcements });
};

exports.createAnnouncement = (req, res) => {
  const { title, content, month_label, day_label, target_url } = req.body;
  if (!title || !month_label || !day_label) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin tiêu đề hoặc mốc ngày/tháng!' });
  }

  const newAnn = {
    id: db.announcements.length + 1,
    title,
    content: content || '',
    month_label,
    day_label,
    target_url: target_url || '#',
    created_at: new Date().toISOString()
  };

  db.announcements.unshift(newAnn);
  saveData();
  logActivity(req.user?.full_name || 'Admin', 'CREATE_ANNOUNCEMENT', 'ANNOUNCEMENT', newAnn.id, `Đã tạo thông báo mốc lịch: ${title}`);

  res.status(201).json({ success: true, data: newAnn, message: 'Tạo thông báo thành công!' });
};
