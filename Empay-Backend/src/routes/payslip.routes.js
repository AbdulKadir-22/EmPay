const express = require('express');
const payslipController = require('../controllers/payslip.controller');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

// Employee routes
router.get('/me', payslipController.getMyPayslips);
router.get('/:id', payslipController.getPayslip);

// Admin/HR/Payroll Officer routes
router.get('/', authorize('ADMIN', 'HR', 'PAYROLL_OFFICER'), payslipController.getAll);

module.exports = router;
