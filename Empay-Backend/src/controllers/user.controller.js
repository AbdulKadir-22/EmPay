const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');
const { formatResponse } = require('../utils/response.util');

const inviteUser = asyncHandler(async (req, res) => {
  req.body.company = req.user.company;
  const user = await userService.inviteUser(req.body);
  res.status(201).json(
    formatResponse(true, 'User invited successfully', { user }, null, req)
  );
});

const updateRole = asyncHandler(async (req, res) => {
  const user = await userService.updateRole(req.params.userId, req.body.role);
  res.status(200).json(
    formatResponse(true, 'User role updated successfully', { user }, null, req)
  );
});

const getUsers = asyncHandler(async (req, res) => {
  req.query.company = req.user.company;
  const users = await userService.getAllUsers(req.query);
  res.status(200).json(
    formatResponse(true, 'Users fetched successfully', { users }, null, req)
  );
});

const getDashboardUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers({ company: req.user.company });
  res.status(200).json(
    formatResponse(true, 'Dashboard users fetched successfully', { users }, null, req)
  );
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.userId, req.body, req.user.company);
  res.status(200).json(
    formatResponse(true, 'User updated successfully', { user }, null, req)
  );
});

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user._id;
  const data = await userService.getUserProfile(userId);
  res.status(200).json(
    formatResponse(true, 'User profile fetched successfully', data, null, req)
  );
});

module.exports = {
  inviteUser,
  updateRole,
  getUsers,
  getDashboardUsers,
  updateUser,
  getUserProfile,
};
