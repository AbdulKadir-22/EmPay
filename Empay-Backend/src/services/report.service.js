const User = require('../models/user.model');
const EmployeeProfile = require('../models/employeeProfile.model');
const Payslip = require('../models/payslip.model');
const SalaryStructure = require('../models/salaryStructure.model');
const Attendance = require('../models/attendance.model');
const mongoose = require('mongoose');

const getDashboardSummary = async () => {
  const [userStats, payrollStats] = await Promise.all([
    User.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Payslip.aggregate([
      { $match: { status: 'GENERATED' } },
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

/**
 * Salary Statement Report — full year payslips for one employee
 */
const getSalaryStatement = async (employeeId, year, company) => {
  // Verify employee belongs to company
  const employee = await User.findOne({ _id: employeeId, company });
  if (!employee) throw new Error('Employee not found in your company');

  const profile = await EmployeeProfile.findOne({ user: employeeId }).lean();
  const salaryStructure = await SalaryStructure.findOne({ employee: employeeId }).lean();

  // Get all payslips for this employee in the given year
  const payslips = await Payslip.find({
    employee: employeeId,
    year: parseInt(year),
  }).sort({ month: 1 }).lean();

  // Get attendance summary for the year
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const attendanceRecords = await Attendance.find({
    employee: employeeId,
    date: { $gte: startDate, $lte: endDate },
  }).lean();

  const totalPresent = attendanceRecords.filter(a => a.status === 'PRESENT').length;
  const totalAbsent = attendanceRecords.filter(a => a.status === 'ABSENT').length;
  const totalLeave = attendanceRecords.filter(a => a.status === 'ON_LEAVE').length;

  // Compute yearly totals from payslips
  const d128 = (v) => parseFloat(v?.$numberDecimal || v || 0);
  const yearlyGross = payslips.reduce((s, p) => s + d128(p.grossSalary), 0);
  const yearlyDeductions = payslips.reduce((s, p) => s + d128(p.totalDeductions), 0);
  const yearlyNet = payslips.reduce((s, p) => s + d128(p.netSalary), 0);

  return {
    employee: {
      _id: employee._id,
      email: employee.email,
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      employeeId: profile?.employeeId || '',
      department: profile?.department || '',
      designation: profile?.designation || '',
      joiningDate: profile?.joiningDate,
      bankDetails: profile?.bankDetails,
      governmentIds: profile?.governmentIds,
      companyName: profile?.companyName || '',
    },
    salaryStructure: salaryStructure ? {
      baseSalary: d128(salaryStructure.baseSalary),
      allowances: (salaryStructure.allowances || []).map(a => ({ name: a.name, amount: d128(a.amount) })),
      deductions: (salaryStructure.deductions || []).map(d => ({ name: d.name, amount: d128(d.amount) })),
    } : null,
    year: parseInt(year),
    payslips: payslips.map(p => ({
      _id: p._id,
      month: p.month,
      year: p.year,
      grossSalary: d128(p.grossSalary),
      totalDeductions: d128(p.totalDeductions),
      netSalary: d128(p.netSalary),
      baseSalary: d128(p.salarySnapshot?.baseSalary),
      attendanceSnapshot: p.attendanceSnapshot,
      status: p.status,
    })),
    attendance: {
      totalPresent,
      totalAbsent,
      totalLeave,
      totalRecords: attendanceRecords.length,
    },
    totals: {
      yearlyGross: parseFloat(yearlyGross.toFixed(2)),
      yearlyDeductions: parseFloat(yearlyDeductions.toFixed(2)),
      yearlyNet: parseFloat(yearlyNet.toFixed(2)),
    },
  };
};

/**
 * Get list of employees for report dropdown
 */
const getCompanyEmployees = async (company) => {
  const users = await User.find({ company, status: 'ACTIVE' }).select('_id email').lean();
  const enriched = await Promise.all(users.map(async (u) => {
    const profile = await EmployeeProfile.findOne({ user: u._id }).select('firstName lastName employeeId department').lean();
    return {
      _id: u._id,
      email: u.email,
      name: profile ? `${profile.firstName} ${profile.lastName}` : u.email,
      employeeId: profile?.employeeId || '',
      department: profile?.department || '',
    };
  }));
  return enriched;
};

module.exports = {
  getDashboardSummary,
  getPayrollCostByMonth,
  getDepartmentStats,
  getAttendanceTrends,
  getSalaryStatement,
  getCompanyEmployees,
};
