const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { formatResponse } = require('../utils/response.util');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json(
    formatResponse(true, 'User registered successfully', { user }, null, req)
  );
});

const login = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.login(req.body.email, req.body.password);
  res.status(200).json(
    formatResponse(true, 'Login successful', { user, tokens }, null, req)
  );
});

const refreshTokens = asyncHandler(async (req, res) => {
  const tokens = await authService.refreshTokens(req.body.refreshToken);
  res.status(200).json(
    formatResponse(true, 'Tokens refreshed successfully', { tokens }, null, req)
  );
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  res.status(200).json(
    formatResponse(true, 'Logged out successfully', null, null, req)
  );
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(
    formatResponse(true, 'User fetched successfully', { user: req.user }, null, req)
  );
});

module.exports = {
  register,
  login,
  refreshTokens,
  logout,
  getMe,
};
