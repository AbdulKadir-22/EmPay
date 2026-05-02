const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['LEAVE_STATUS', 'PAYSLIP_GENERATED', 'SYSTEM_ANNOUNCEMENT', 'ATTENDANCE_REMINDER'],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
