const express = require('express');
const employeeController = require('../controllers/employee.controller');
const employeeValidator = require('../validators/employee.validator');
const validate = require('../middlewares/validation.middleware');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

router.get('/me', employeeController.getProfile);
router.patch('/me', validate(employeeValidator.updateProfile), employeeController.updateProfile);

router.get('/team', authorize('MANAGER', 'ADMIN', 'HR'), employeeController.getMyTeam);

router.get('/:userId', authorize('ADMIN', 'HR', 'MANAGER'), employeeController.getProfile);
router.patch('/:userId', authorize('ADMIN', 'HR'), validate(employeeValidator.updateProfile), employeeController.updateProfile);
router.delete('/:userId', authorize('ADMIN', 'HR'), employeeController.deleteEmployee);

router.post('/:userId/documents', authorize('ADMIN', 'HR'), validate(employeeValidator.uploadDocument), employeeController.uploadDoc);

module.exports = router;
