const notificationService = require('../services/notification.service');
const asyncHandler = require('../utils/asyncHandler');
const { formatResponse } = require('../utils/response.util');

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getMyNotifications(req.user._id);
  res.status(200).json(
    formatResponse(true, 'Notifications fetched', { notifications }, null, req)
  );
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  res.status(200).json(
    formatResponse(true, 'Notification marked as read', { notification }, null, req)
  );
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  res.status(200).json(
    formatResponse(true, 'All notifications marked as read', null, null, req)
  );
});

module.exports = {
  getMyNotifications,
  markRead,
  markAllRead,
};
