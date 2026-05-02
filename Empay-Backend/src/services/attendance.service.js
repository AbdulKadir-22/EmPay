const Attendance = require('../models/attendance.model');
const mongoose = require('mongoose');

const clockIn = async (userId, ipAddress) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await Attendance.findOne({ employee: userId, date: today });
  if (existing) throw new Error('Already clocked in today');

  return Attendance.create({
    employee: userId,
    date: today,
    clockIn: new Date(),
    status: 'PRESENT', // Default to present on clock in
    location: { clockInIp: ipAddress },
  });
};

const clockOut = async (userId, ipAddress) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({ employee: userId, date: today });
  if (!attendance) throw new Error('No clock-in record found for today');
  if (attendance.clockOut) throw new Error('Already clocked out today');

  attendance.clockOut = new Date();
  attendance.location.clockOutIp = ipAddress;
  
  // Calculate work hours
  const diff = attendance.clockOut - attendance.clockIn;
  attendance.workHours = parseFloat((diff / (1000 * 60 * 60)).toFixed(2));

  await attendance.save();
  return attendance;
};

const manualEntry = async (adminId, data) => {
  const date = new Date(data.date);
  date.setHours(0, 0, 0, 0);

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
  if (filters.employeeId) query.employee = filters.employeeId;
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }
  if (filters.status) query.status = filters.status;

  return Attendance.find(query).populate('employee', 'firstName lastName email').sort({ date: -1 });
};

module.exports = {
  clockIn,
  clockOut,
  manualEntry,
  getAttendanceSummary,
};
