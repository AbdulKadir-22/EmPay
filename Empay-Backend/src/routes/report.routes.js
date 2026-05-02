const express = require('express');
const reportController = require('../controllers/report.controller');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN', 'HR'));

router.get('/dashboard', reportController.getAdminDashboard);
router.get('/payroll-cost', reportController.getPayrollReport);
router.get('/distribution', reportController.getEmployeeDistribution);
router.get('/attendance-trends', reportController.getAttendanceSummary);

module.exports = router;
