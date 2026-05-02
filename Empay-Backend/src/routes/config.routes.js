const express = require('express');
const configController = require('../controllers/config.controller');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

// Global settings and profile (Read-only for all, Write for Admin)
router.get('/profile', configController.getProfile);
router.get('/settings', authorize('ADMIN', 'HR'), configController.getSettings);

router.patch('/profile', authorize('ADMIN'), configController.updateProfile);
router.patch('/settings', authorize('ADMIN'), configController.updateSetting);

module.exports = router;
