const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    clockIn: {
      type: Date,
    },
    clockOut: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE'],
      default: 'ABSENT',
      index: true,
    },
    workHours: {
      type: Number,
      default: 0,
    },
    location: {
      clockInIp: String,
      clockOutIp: String,
    },
    manualEntry: {
      isManual: { type: Boolean, default: false },
      reason: String,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for unique daily entry per employee
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
