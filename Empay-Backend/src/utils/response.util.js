/**
 * Standard Response Formatter
 * @param {boolean} success - Operation status
 * @param {string} message - Response message
 * @param {object} data - Data payload
 * @param {object} error - Error details
 * @param {object} req - Request object to extract metadata
 * @returns {object} Formatted response
 */
const formatResponse = (success, message, data = null, error = null, req = null) => {
  return {
    success,
    message,
    data,
    error: error ? {
      code: error.code || 'INTERNAL_ERROR',
      details: error.details || error.message || null
    } : null,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req ? req.id : null,
    }
  };
};

module.exports = { formatResponse };
