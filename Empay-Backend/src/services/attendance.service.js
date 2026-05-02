const Attendance = require('../models/attendance.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

const clockIn = async (userId, ipAddress) => {
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  const existing = await Attendance.findOne({ employee: userId, date: today });
  if (existing) throw new Error('Already clocked in today');

  return Attendance.create({
    employee: userId,
    date: today,
    clockIn: new Date(),
    status: 'PRESENT',
    location: { clockInIp: ipAddress },
  });
};

const clockOut = async (userId, ipAddress) => {
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  const attendance = await Attendance.findOne({ employee: userId, date: today });
  if (!attendance) throw new Error('No clock-in record found for today');
  if (attendance.clockOut) throw new Error('Already clocked out today');

  attendance.clockOut = new Date();
  attendance.location.clockOutIp = ipAddress;
  
  const diff = attendance.clockOut - attendance.clockIn;
  attendance.workHours = parseFloat((diff / (1000 * 60 * 60)).toFixed(2));

  await attendance.save();
  return attendance;
};

const getTodayStatus = async (userId) => {
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  return Attendance.findOne({ employee: userId, date: today });
};

const manualEntry = async (adminId, data) => {
  const d = new Date(data.date);
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

  const update = {
    status: data.status,
    clockIn: data.clockIn ? new Date(data.clockIn) : undefined,
    clockOut: data.clockOut ? new Date(data.clockOut) : undefined,
    manualEntry: {
      isManual: true,
      reason: data.reason,
      updatedBy: adminId,
    }
  };

  if (update.clockIn && update.clockOut) {
    const diff = update.clockOut - update.clockIn;
    update.workHours = parseFloat((diff / (1000 * 60 * 60)).toFixed(2));
  }

  return Attendance.findOneAndUpdate(
    { employee: data.employeeId, date },
    { $set: update },
    { upsert: true, new: true }
  );
};

const getAttendanceSummary = async (filters) => {
  const query = {};
  
  if (filters.employeeId) {
    query.employee = new mongoose.Types.ObjectId(filters.employeeId);
  } else if (filters.company) {
    // Get all user IDs from this company
    const companyUsers = await User.find({ company: filters.company }).select('_id');
    const userIds = companyUsers.map(u => u._id);
    query.employee = { $in: userIds };
  }

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }
  if (filters.status) query.status = filters.status;

  return Attendance.find(query)
    .populate('employee', 'email')
    .sort({ date: -1 })
    .lean()
    .then(async (records) => {
      // Enrich with employee profile names
      const EmployeeProfile = require('../models/employeeProfile.model');
      const enriched = await Promise.all(records.map(async (rec) => {
        const profile = await EmployeeProfile.findOne({ user: rec.employee._id }).select('firstName lastName').lean();
        return {
          ...rec,
          employeeName: profile ? `${profile.firstName} ${profile.lastName}` : rec.employee.email,
          employeeEmail: rec.employee.email,
        };
      }));
      return enriched;
    });
};

module.exports = {
  clockIn,
  clockOut,
  getTodayStatus,
  manualEntry,
  getAttendanceSummary,
};
