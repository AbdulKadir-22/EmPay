const { ZodError } = require('zod');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { formatResponse } = require('../utils/response.util');
const logger = require('../utils/logger.util');

/**
 * Centralized error handler middleware
 */
const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorDetails = null;

  // Log the error
  logger.error(`${req.method} ${req.url} - ${message}`);
  if (process.env.NODE_ENV === 'development') {
    logger.debug(err.stack);
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = {
      code: 'VALIDATION_ERROR',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    };
  }

  // Handle Mongoose/MongoDB Errors
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Database Validation Error';
    errorDetails = {
      code: 'DB_VALIDATION_ERROR',
      details: Object.values(err.errors).map(e => ({
        path: e.path,
        message: e.message
      }))
    };
  }
  else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate Field Error';
    errorDetails = {
      code: 'DUPLICATE_KEY_ERROR',
      details: Object.keys(err.keyValue).map(key => `${key} already exists`)
    };
  }
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    errorDetails = { code: 'CAST_ERROR' };
  }

  // Handle JWT Errors
  else if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = 'Invalid Token';
    errorDetails = { code: 'JWT_INVALID' };
  }
  else if (err instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = 'Token Expired';
    errorDetails = { code: 'JWT_EXPIRED' };
  }

  // Final Response
  res.status(statusCode).json(
    formatResponse(false, message, null, errorDetails || { message: err.message }, req)
  );
};

module.exports = errorMiddleware;
