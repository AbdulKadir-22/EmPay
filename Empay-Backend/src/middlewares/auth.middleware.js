const User = require('../models/user.model');
const { verifyAccessToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware to protect routes with JWT authentication
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const error = new Error('Authentication token is missing');
    error.statusCode = 401;
    throw error;
  }
 
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
 
    if (!user || user.tokenVersion !== payload.version) {
      const error = new Error('Invalid token or user not found');
      error.statusCode = 401;
      throw error;
    }
 
    if (user.status !== 'ACTIVE') {
      const error = new Error('User account is not active');
      error.statusCode = 401;
      throw error;
    }
 
    req.user = user;
    next();
  } catch (error) {
    if (!error.statusCode) error.statusCode = 401;
    if (!error.message) error.message = 'Not authorized to access this route';
    throw error;
  }
});

module.exports = protect;
