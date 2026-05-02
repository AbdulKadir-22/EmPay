const leaveService = require('../services/leave.service');
const asyncHandler = require('../utils/asyncHandler');
const { formatResponse } = require('../utils/response.util');

const createType = asyncHandler(async (req, res) => {
  const type = await leaveService.createLeaveType(req.body);
  res.status(201).json(
    formatResponse(true, 'Leave type created', { type }, null, req)
  );
});

const getTypes = asyncHandler(async (req, res) => {
  const types = await leaveService.getLeaveTypes();
  res.status(200).json(
    formatResponse(true, 'Leave types fetched', { types }, null, req)
  );
});

const allocate = asyncHandler(async (req, res) => {
  const allocation = await leaveService.allocateLeave(req.body);
  res.status(200).json(
    formatResponse(true, 'Leave allocated successfully', { allocation }, null, req)
  );
});

const request = asyncHandler(async (req, res) => {
  const leaveRequest = await leaveService.requestLeave(req.user._id, req.body);
  res.status(201).json(
    formatResponse(true, 'Leave request submitted', { leaveRequest }, null, req)
  );
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status, comment } = req.body;
  const updatedRequest = await leaveService.updateRequestStatus(req.user._id, req.params.requestId, status, comment);
  res.status(200).json(
    formatResponse(true, `Leave request ${status.toLowerCase()}`, { request: updatedRequest }, null, req)
  );
});

const getMyHistory = asyncHandler(async (req, res) => {
  const history = await leaveService.getMyLeaveHistory(req.user._id);
  res.status(200).json(
    formatResponse(true, 'Leave history fetched', { history }, null, req)
  );
});

const getMyAllocations = asyncHandler(async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const allocations = await leaveService.getLeaveAllocations(req.user._id, parseInt(year));
  res.status(200).json(
    formatResponse(true, 'Leave allocations fetched', { allocations }, null, req)
  );
});

const getPending = asyncHandler(async (req, res) => {
  const requests = await leaveService.getPendingRequests(req.user.company);
  res.status(200).json(
    formatResponse(true, 'Pending requests fetched', { requests }, null, req)
  );
});

module.exports = {
  createType,
  getTypes,
  allocate,
  request,
  updateStatus,
  getMyHistory,
  getMyAllocations,
  getPending,
};
