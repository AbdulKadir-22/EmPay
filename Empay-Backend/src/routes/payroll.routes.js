const express = require('express');
const payrollController = require('../controllers/payroll.controller');
const payrollValidator = require('../validators/payroll.validator');
const validate = require('../middlewares/validation.middleware');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

// Salary Structure Routes
router.get('/structure/:userId?', payrollController.getSalaryStructure);
router.patch('/structure/:userId', authorize('ADMIN', 'HR'), validate(payrollValidator.updateSalaryStructure), payrollController.updateSalaryStructure);

// Payrun Routes
router.get('/payruns', authorize('ADMIN', 'HR'), payrollController.getPayruns);
router.post('/payruns', authorize('ADMIN', 'HR'), validate(payrollValidator.createPayrun), payrollController.createPayrun);
router.post('/payruns/:payrunId/process', authorize('ADMIN', 'HR'), payrollController.processPayroll);
router.post('/payruns/:payrunId/finalize', authorize('ADMIN', 'HR'), payrollController.finalizePayrun);

module.exports = router;
