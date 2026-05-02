const Notification = require('../models/notification.model');

const createNotification = async ({ recipient, title, message, type, link }) => {
  return Notification.create({
    recipient,
    title,
    message,
    type,
    link,
  });
};

const getMyNotifications = async (userId) => {
  return Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(50);
};

const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { $set: { status: 'READ' } },
    { new: true }
  );
};

const markAllAsRead = async (userId) => {
  return Notification.updateMany(
    { recipient: userId, status: 'UNREAD' },
    { $set: { status: 'READ' } }
  );
};

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
