const mongoose = require('mongoose');

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['PAYROLL_MONTHLY', 'ATTENDANCE_DAILY', 'LEAVE_SUMMARY'],
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    metadata: {
      department: String,
      location: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

analyticsSnapshotSchema.index({ type: 1, date: 1 });

const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);

module.exports = AnalyticsSnapshot;
