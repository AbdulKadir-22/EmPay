const express = require('express');
const payrollController = require('../controllers/payroll.controller');
const payrollValidator = require('../validators/payroll.validator');
const validate = require('../middlewares/validation.middleware');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

// Dashboard
router.get('/dashboard', authorize('ADMIN', 'PAYROLL_OFFICER'), payrollController.getPayrollDashboard);

// Salary Structure Routes
router.get('/structure/:userId?', payrollController.getSalaryStructure);
router.patch('/structure/:userId', authorize('ADMIN', 'HR', 'PAYROLL_OFFICER'), validate(payrollValidator.updateSalaryStructure), payrollController.updateSalaryStructure);

// Payrun Routes
router.get('/payruns', authorize('ADMIN', 'HR', 'PAYROLL_OFFICER'), payrollController.getPayruns);
router.get('/payruns/:payrunId', authorize('ADMIN', 'HR', 'PAYROLL_OFFICER'), payrollController.getPayrunWithSlips);
router.post('/payruns', authorize('ADMIN', 'HR', 'PAYROLL_OFFICER'), validate(payrollValidator.createPayrun), payrollController.createPayrun);
router.post('/payruns/:payrunId/process', authorize('ADMIN', 'HR', 'PAYROLL_OFFICER'), payrollController.processPayroll);
router.post('/payruns/:payrunId/finalize', authorize('ADMIN', 'HR', 'PAYROLL_OFFICER'), payrollController.finalizePayrun);

module.exports = router;
