const User = require('../models/user.model');
const EmployeeProfile = require('../models/employeeProfile.model');
const Payslip = require('../models/payslip.model');
const Attendance = require('../models/attendance.model');
const mongoose = require('mongoose');

const getDashboardSummary = async () => {
  const [userStats, payrollStats] = await Promise.all([
    User.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Payslip.aggregate([
      { $match: { status: 'GENERATED' } }, // Simple: assuming generated means valid
      { $group: { _id: null, totalNet: { $sum: '$netSalary' }, count: { $sum: 1 } } }
    ])
  ]);

  return {
    users: userStats,
    payroll: payrollStats[0] || { totalNet: 0, count: 0 }
  };
};

const getPayrollCostByMonth = async () => {
  return Payslip.aggregate([
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        totalGross: { $sum: '$grossSalary' },
        totalNet: { $sum: '$netSalary' },
        totalDeductions: { $sum: '$totalDeductions' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } }
  ]);
};

const getDepartmentStats = async () => {
  return EmployeeProfile.aggregate([
    { $group: { _id: '$department', employeeCount: { $sum: 1 } } }
  ]);
};

const getAttendanceTrends = async (startDate, endDate) => {
  return Attendance.aggregate([
    {
      $match: {
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
};

module.exports = {
  getDashboardSummary,
  getPayrollCostByMonth,
  getDepartmentStats,
  getAttendanceTrends,
};
