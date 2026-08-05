// TẦNG NGHIỆP VỤ - Portal Utility & Directory
const { db, saveData } = require('../config/dbStore');

exports.getUtilities = (req, res) => {
  const sorted = [...db.utilities].sort((a, b) => a.order_index - b.order_index);
  res.json({ success: true, data: sorted });
};

exports.updateUtilities = (req, res) => {
  if (Array.isArray(req.body)) {
    db.utilities = req.body;
    saveData();
    return res.json({ success: true, message: 'Cập nhật danh mục tiện ích thành công!' });
  }
  res.status(400).json({ success: false, message: 'Dữ liệu danh mục không hợp lệ!' });
};
