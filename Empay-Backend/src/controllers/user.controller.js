const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');
const { formatResponse } = require('../utils/response.util');

const inviteUser = asyncHandler(async (req, res) => {
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
  const users = await userService.getAllUsers(req.query);
  res.status(200).json(
    formatResponse(true, 'Users fetched successfully', { users }, null, req)
  );
});

module.exports = {
  inviteUser,
  updateRole,
  getUsers,
};
