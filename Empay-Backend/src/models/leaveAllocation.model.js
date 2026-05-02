const mongoose = require('mongoose');

const leaveAllocationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaveType',
      required: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    usedDays: {
      type: Number,
      default: 0,
    },
    remainingDays: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Unique allocation per employee per leave type per year
leaveAllocationSchema.index({ employee: 1, leaveType: 1, year: 1 }, { unique: true });

const LeaveAllocation = mongoose.model('LeaveAllocation', leaveAllocationSchema);

module.exports = LeaveAllocation;
