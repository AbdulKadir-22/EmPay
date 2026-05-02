const reportService = require('../services/report.service');
const asyncHandler = require('../utils/asyncHandler');
const { formatResponse } = require('../utils/response.util');

const getAdminDashboard = asyncHandler(async (req, res) => {
  const summary = await reportService.getDashboardSummary();
  res.status(200).json(
    formatResponse(true, 'Admin dashboard summary fetched', summary, null, req)
  );
});

const getPayrollReport = asyncHandler(async (req, res) => {
  const reports = await reportService.getPayrollCostByMonth();
  res.status(200).json(
    formatResponse(true, 'Monthly payroll reports fetched', { reports }, null, req)
  );
});

const getEmployeeDistribution = asyncHandler(async (req, res) => {
  const stats = await reportService.getDepartmentStats();
  res.status(200).json(
    formatResponse(true, 'Employee distribution fetched', { stats }, null, req)
  );
});

const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate || new Date();
  
  const summary = await reportService.getAttendanceTrends(start, end);
  res.status(200).json(
    formatResponse(true, 'Attendance trends fetched', { summary }, null, req)
  );
});

module.exports = {
  getAdminDashboard,
  getPayrollReport,
  getEmployeeDistribution,
  getAttendanceSummary,
};
