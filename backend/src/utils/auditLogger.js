const AuditLog = require('../models/AuditLog');

const logAction = async ({ action, performedBy, targetUser = null, targetLeave = null, details = {}, req = null }) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    await AuditLog.create({
      action,
      performedBy,
      targetUser,
      targetLeave,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('[AuditLog Error]', err.message);
  }
};

module.exports = { logAction };
