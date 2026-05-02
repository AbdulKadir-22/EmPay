const AuditLog = require('../models/auditLog.model');

const logAction = async ({
  userId,
  action,
  module,
  resourceId,
  oldValue = null,
  newValue = null,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      module,
      resourceId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    // We don't want to break the main flow if logging fails, but we should log it
    console.error('Audit Logging Failed:', error);
  }
};

const getLogs = async (filters = {}) => {
  return AuditLog.find(filters).populate('user', 'firstName lastName email').sort({ createdAt: -1 });
};

module.exports = {
  logAction,
  getLogs,
};
