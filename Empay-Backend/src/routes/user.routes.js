const express = require('express');
const userController = require('../controllers/user.controller');
const userValidator = require('../validators/user.validator');
const validate = require('../middlewares/validation.middleware');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

// Dashboard — all roles
router.get('/dashboard', userController.getDashboardUsers);

// Profile — own profile (all roles) or specific user (management)
router.get('/profile/me', userController.getUserProfile);
router.get('/profile/:userId', authorize('ADMIN', 'HR', 'PAYROLL_OFFICER'), userController.getUserProfile);

// User management (Admin/HR)
router.get('/', authorize('ADMIN', 'HR', 'PAYROLL_OFFICER'), userController.getUsers);
router.post('/invite', authorize('ADMIN', 'HR'), validate(userValidator.inviteUser), userController.inviteUser);
router.patch('/:userId', authorize('ADMIN', 'HR'), userController.updateUser);
router.patch('/:userId/role', authorize('ADMIN'), validate(userValidator.updateRole), userController.updateRole);

module.exports = router;
