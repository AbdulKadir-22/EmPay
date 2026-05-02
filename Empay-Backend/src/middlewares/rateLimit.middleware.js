const rateLimit = require('express-rate-limit');
const { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } = require('../../config/env');
const { formatResponse } = require('../utils/response.util');

const apiRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      formatResponse(false, 'Too many requests, please try again later.', null, { code: 'RATE_LIMIT_EXCEEDED' }, req)
    );
  },
});

module.exports = apiRateLimiter;
