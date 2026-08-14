// TẦNG NGHIỆP VỤ - Quản lý Cấu hình Trang Bìa & Liên Kết Nhanh
const { db, saveData } = require('../config/dbStore');
const { logActivity } = require('../middleware/auditLogger');

exports.getSiteSettings = (req, res) => {
  res.json({
    success: true,
    data: db.site_settings || {
      agency_title: 'ỦY BAN NHÂN DÂN XÃ HỮU LŨNG - TỈNH LẠNG SƠN',
      school_name: 'TRƯỜNG THCS ĐỒNG TÂN',
      address: 'Xã Hữu Lũng - Tỉnh Lạng Sơn',
      phone: '(0205) 3885.6789',
      email: 'thcsdongtan.huulung@langson.edu.vn',
      quick_links: []
    }
  });
};

exports.updateSiteSettings = (req, res) => {
  const { agency_title, school_name, address, phone, email, quick_links } = req.body;

  if (!db.site_settings) {
    db.site_settings = {};
  }

  if (agency_title !== undefined) db.site_settings.agency_title = agency_title;
  if (school_name !== undefined) db.site_settings.school_name = school_name;
  if (address !== undefined) db.site_settings.address = address;
  if (phone !== undefined) db.site_settings.phone = phone;
  if (email !== undefined) db.site_settings.email = email;
  if (quick_links !== undefined && Array.isArray(quick_links)) {
    db.site_settings.quick_links = quick_links;
  }

  saveData();
  logActivity(req.user.full_name, 'UPDATE_SITE_SETTINGS', 'SITE_CONFIG', 1, 'Đã cập nhật nội dung trang bìa & đường liên kết nhanh');

  res.json({
    success: true,
    data: db.site_settings,
    message: 'Cập nhật cấu hình trang bìa và liên kết nhanh thành công!'
  });
};
