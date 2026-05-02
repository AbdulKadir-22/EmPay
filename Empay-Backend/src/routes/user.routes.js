const express = require('express');
const userController = require('../controllers/user.controller');
const userValidator = require('../validators/user.validator');
const validate = require('../middlewares/validation.middleware');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

router.get('/', authorize('ADMIN', 'HR', 'PAYROLL_OFFICER'), userController.getUsers);
router.post('/invite', authorize('ADMIN', 'HR'), validate(userValidator.inviteUser), userController.inviteUser);
router.patch('/:userId/role', authorize('ADMIN'), validate(userValidator.updateRole), userController.updateRole);

module.exports = router;
