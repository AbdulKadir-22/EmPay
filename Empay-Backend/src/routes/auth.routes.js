const express = require('express');
const authController = require('../controllers/auth.controller');
const authValidator = require('../validators/auth.validator');
const validate = require('../middlewares/validation.middleware');
const protect = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', validate(authValidator.register), authController.register);
router.post('/login', validate(authValidator.login), authController.login);
router.post('/refresh-token', validate(authValidator.refreshToken), authController.refreshTokens);

router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

module.exports = router;
