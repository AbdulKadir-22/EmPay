/**
 * Middleware to restrict access based on user roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error(`User role ${req.user ? req.user.role : 'none'} is not authorized to access this route`);
      error.statusCode = 403;
      throw error;
    }
    next();
  };
};

module.exports = authorize;
