const express = require('express');
const payslipController = require('../controllers/payslip.controller');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

// Employee routes
router.get('/me', payslipController.getMyPayslips);
router.get('/:id', payslipController.getPayslip);

// Admin/HR routes
router.get('/', authorize('ADMIN', 'HR'), payslipController.getAll);
router.post('/:id/send-email', authorize('ADMIN', 'HR'), payslipController.sendEmail);
router.post('/:id/generate-pdf', authorize('ADMIN', 'HR'), payslipController.generatePDF);

module.exports = router;
