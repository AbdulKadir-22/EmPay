const express = require('express');
const notificationController = require('../controllers/notification.controller');
const protect = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/me', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markRead);
router.patch('/mark-all-read', notificationController.markAllRead);

module.exports = router;
