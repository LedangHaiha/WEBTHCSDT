// TẦNG CƠ SỞ DỮ LIỆU - Audit & Activity Logs Recorder
const { db, saveData } = require('../config/dbStore');

function logActivity(userName, action, entityType, entityId, details) {
  const newLog = {
    id: db.audit_logs.length + 1,
    user_name: userName || 'Hệ thống',
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    details: details || '',
    created_at: new Date().toISOString()
  };

  db.audit_logs.unshift(newLog);
  if (db.audit_logs.length > 500) {
    db.audit_logs.pop(); // Giữ tối đa 500 bản ghi mới nhất
  }
  saveData();
}

module.exports = { logActivity };
