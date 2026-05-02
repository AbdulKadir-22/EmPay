const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    module: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

auditLogSchema.index({ action: 1, module: 1 });
auditLogSchema.index({ createdAt: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
