const attendanceService = require('../services/attendance.service');
const asyncHandler = require('../utils/asyncHandler');
const { formatResponse } = require('../utils/response.util');

const clockIn = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'];
  const attendance = await attendanceService.clockIn(req.user._id, ip);
  res.status(201).json(
    formatResponse(true, 'Clocked in successfully', { attendance }, null, req)
  );
});

const clockOut = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'];
  const attendance = await attendanceService.clockOut(req.user._id, ip);
  res.status(200).json(
    formatResponse(true, 'Clocked out successfully', { attendance }, null, req)
  );
});

const getTodayStatus = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.getTodayStatus(req.user._id);
  res.status(200).json(
    formatResponse(true, 'Today status fetched', { attendance }, null, req)
  );
});

const manualEntry = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.manualEntry(req.user._id, req.body);
  res.status(200).json(
    formatResponse(true, 'Manual attendance updated', { attendance }, null, req)
  );
});

const getSummary = asyncHandler(async (req, res) => {
  if (req.user.role === 'EMPLOYEE') {
    req.query.employeeId = req.user._id.toString();
  } else {
    // Scope to caller's company for management roles
    req.query.company = req.user.company;
  }
  
  const summary = await attendanceService.getAttendanceSummary(req.query);
  res.status(200).json(
    formatResponse(true, 'Attendance records fetched', { summary }, null, req)
  );
});

module.exports = {
  clockIn,
  clockOut,
  getTodayStatus,
  manualEntry,
  getSummary,
};
