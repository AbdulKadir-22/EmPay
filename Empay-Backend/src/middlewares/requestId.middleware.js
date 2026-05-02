const { v4: uuidv4 } = require('uuid');

/**
 * Middleware to add a unique request ID to each request
 */
const requestIdMiddleware = (req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
};

module.exports = requestIdMiddleware;
