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
    throw new Error('Not authorized to access this route');
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);

    if (!user || user.tokenVersion !== payload.version) {
      throw new Error('Not authorized to access this route');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('User account is not active');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new Error('Not authorized to access this route');
  }
});

module.exports = protect;
