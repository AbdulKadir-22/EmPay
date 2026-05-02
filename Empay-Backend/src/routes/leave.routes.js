const express = require('express');
const leaveController = require('../controllers/leave.controller');
const leaveValidator = require('../validators/leave.validator');
const validate = require('../middlewares/validation.middleware');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

// Employee routes
router.get('/my-history', leaveController.getMyHistory);
router.get('/my-allocations', leaveController.getMyAllocations);
router.post('/request', validate(leaveValidator.requestLeave), leaveController.request);

// Admin/HR routes
router.get('/types', leaveController.getTypes);
router.post('/types', authorize('ADMIN', 'HR'), validate(leaveValidator.createLeaveType), leaveController.createType);
router.post('/allocate', authorize('ADMIN', 'HR'), validate(leaveValidator.allocateLeave), leaveController.allocate);

// Manager/HR/Admin routes
router.get('/pending', authorize('PAYROLL_OFFICER', 'HR', 'ADMIN'), leaveController.getPending);
router.patch('/:requestId/status', authorize('PAYROLL_OFFICER', 'HR', 'ADMIN'), validate(leaveValidator.updateStatus), leaveController.updateStatus);

module.exports = router;
