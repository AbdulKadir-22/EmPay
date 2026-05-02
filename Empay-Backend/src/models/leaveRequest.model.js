const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    days: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    comment: String,
    attachments: [String],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

leaveRequestSchema.index({ employee: 1, status: 1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

module.exports = LeaveRequest;
