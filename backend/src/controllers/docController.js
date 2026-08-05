// TẦNG NGHIỆP VỤ - Administrative Documents & VBHC
const { db, saveData } = require('../config/dbStore');
const { logActivity } = require('../middleware/auditLogger');

exports.getDocuments = (req, res) => {
  res.json({ success: true, data: db.documents });
};

exports.createDocument = (req, res) => {
  const { doc_number, title, category, published_date } = req.body;
  if (!doc_number || !title) {
    return res.status(400).json({ success: false, message: 'Số hiệu văn bản và trích yếu là bắt buộc!' });
  }

  const newDoc = {
    id: db.documents.length + 1,
    doc_number,
    title,
    category: category || 'VBHC',
    published_date: published_date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  db.documents.unshift(newDoc);
  saveData();
  logActivity(req.user?.full_name || 'Admin', 'CREATE_DOC', 'DOCUMENT', newDoc.id, `Công bố văn bản: ${doc_number}`);

  res.status(201).json({ success: true, data: newDoc, message: 'Công bố văn bản thành công!' });
};
