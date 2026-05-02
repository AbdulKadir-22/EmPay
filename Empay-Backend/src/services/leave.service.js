const LeaveRequest = require('../models/leaveRequest.model');
const LeaveAllocation = require('../models/leaveAllocation.model');
const LeaveType = require('../models/leaveType.model');
const mongoose = require('mongoose');

const createLeaveType = async (data) => {
  return LeaveType.create(data);
};

const allocateLeave = async (data) => {
  return LeaveAllocation.findOneAndUpdate(
    { employee: data.employeeId, leaveType: data.leaveTypeId, year: data.year },
    { $set: { totalDays: data.totalDays, remainingDays: data.totalDays } },
    { upsert: true, new: true }
  );
};

const requestLeave = async (userId, data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (days <= 0) throw new Error('Invalid leave duration');

  const allocation = await LeaveAllocation.findOne({
    employee: userId,
    leaveType: data.leaveTypeId,
    year: start.getFullYear(),
  });

  if (!allocation || allocation.remainingDays < days) {
    throw new Error('Insufficient leave balance');
  }

  return LeaveRequest.create({
    employee: userId,
    leaveType: data.leaveTypeId,
    startDate: start,
    endDate: end,
    days,
    reason: data.reason,
    status: 'PENDING',
  });
};

const updateRequestStatus = async (adminId, requestId, status, comment) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const request = await LeaveRequest.findById(requestId);
    if (!request) throw new Error('Leave request not found');
    if (request.status !== 'PENDING') throw new Error('Request already processed');

    if (status === 'APPROVED') {
      const allocation = await LeaveAllocation.findOne({
        employee: request.employee,
        leaveType: request.leaveType,
        year: request.startDate.getFullYear(),
      });

      if (!allocation || allocation.remainingDays < request.days) {
        throw new Error('Insufficient leave balance at the time of approval');
      }

      allocation.usedDays += request.days;
      allocation.remainingDays -= request.days;
      await allocation.save({ session });
    }

    request.status = status;
    request.approvedBy = adminId;
    request.comment = comment;
    await request.save({ session });

    await session.commitTransaction();
    return request;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getMyLeaveHistory = async (userId) => {
  return LeaveRequest.find({ employee: userId }).populate('leaveType').sort({ createdAt: -1 });
};

const getLeaveAllocations = async (userId, year) => {
  return LeaveAllocation.find({ employee: userId, year }).populate('leaveType');
};

const getPendingRequests = async (managerId) => {
  // Simple implementation: HR/Admin can see all, Managers see team.
  // For now, returning all pending for the authorized user.
  return LeaveRequest.find({ status: 'PENDING' }).populate('employee', 'firstName lastName').populate('leaveType');
};

module.exports = {
  createLeaveType,
  allocateLeave,
  requestLeave,
  updateRequestStatus,
  getMyLeaveHistory,
  getLeaveAllocations,
  getPendingRequests,
};
