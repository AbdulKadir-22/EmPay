const express = require('express');
const attendanceController = require('../controllers/attendance.controller');
const attendanceValidator = require('../validators/attendance.validator');
const validate = require('../middlewares/validation.middleware');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

router.get('/today', attendanceController.getTodayStatus);
router.post('/clock-in', validate(attendanceValidator.clockIn), attendanceController.clockIn);
router.post('/clock-out', validate(attendanceValidator.clockOut), attendanceController.clockOut);

router.get('/summary', attendanceController.getSummary);

router.post('/manual', authorize('ADMIN', 'HR'), validate(attendanceValidator.manualEntry), attendanceController.manualEntry);

module.exports = router;
