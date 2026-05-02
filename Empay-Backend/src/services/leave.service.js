const LeaveRequest = require('../models/leaveRequest.model');
const LeaveAllocation = require('../models/leaveAllocation.model');
const LeaveType = require('../models/leaveType.model');
const mongoose = require('mongoose');

const createLeaveType = async (data) => {
  return LeaveType.create(data);
};

const getLeaveTypes = async () => {
  return LeaveType.find({ isActive: true }).sort({ name: 1 });
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

const getPendingRequests = async (company) => {
  const User = require('../models/user.model');
  const companyUsers = await User.find({ company }).select('_id');
  const userIds = companyUsers.map(u => u._id);
  return LeaveRequest.find({ status: 'PENDING', employee: { $in: userIds } })
    .populate('employee', 'email')
    .populate('leaveType')
    .sort({ createdAt: -1 })
    .lean()
    .then(async (records) => {
      const EmployeeProfile = require('../models/employeeProfile.model');
      return Promise.all(records.map(async (rec) => {
        const profile = await EmployeeProfile.findOne({ user: rec.employee._id }).select('firstName lastName').lean();
        return { ...rec, employeeName: profile ? `${profile.firstName} ${profile.lastName}` : rec.employee.email };
      }));
    });
};

module.exports = {
  createLeaveType,
  getLeaveTypes,
  allocateLeave,
  requestLeave,
  updateRequestStatus,
  getMyLeaveHistory,
  getLeaveAllocations,
  getPendingRequests,
};
