const employeeService = require('../services/employee.service');
const asyncHandler = require('../utils/asyncHandler');
const { formatResponse } = require('../utils/response.util');

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user._id;
  const profile = await employeeService.getEmployeeByUserId(userId);
  res.status(200).json(
    formatResponse(true, 'Profile fetched successfully', { profile }, null, req)
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user._id;
  const profile = await employeeService.updateEmployeeProfile(userId, req.body);
  res.status(200).json(
    formatResponse(true, 'Profile updated successfully', { profile }, null, req)
  );
});

const deleteEmployee = asyncHandler(async (req, res) => {
  await employeeService.deleteEmployee(req.params.userId);
  res.status(200).json(
    formatResponse(true, 'Employee deactivated successfully', null, null, req)
  );
});

const uploadDoc = asyncHandler(async (req, res) => {
  const profile = await employeeService.addDocument(req.params.userId, req.body);
  res.status(200).json(
    formatResponse(true, 'Document added successfully', { profile }, null, req)
  );
});

const getMyTeam = asyncHandler(async (req, res) => {
  const team = await employeeService.getTeam(req.user._id);
  res.status(200).json(
    formatResponse(true, 'Team fetched successfully', { team }, null, req)
  );
});

module.exports = {
  getProfile,
  updateProfile,
  deleteEmployee,
  uploadDoc,
  getMyTeam,
};
