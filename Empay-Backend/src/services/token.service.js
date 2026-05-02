const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

/**
 * Generate auth tokens for a user
 * @param {object} user - User document
 * @returns {object} tokens
 */
const generateAuthTokens = (user) => {
  const payload = {
    sub: user._id,
    role: user.role,
    version: user.tokenVersion,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    access: {
      token: accessToken,
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    },
    refresh: {
      token: refreshToken,
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    },
  };
};

module.exports = { generateAuthTokens };
