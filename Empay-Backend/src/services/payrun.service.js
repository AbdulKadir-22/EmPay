const Payrun = require('../models/payrun.model');
const Payslip = require('../models/payslip.model');
const SalaryStructure = require('../models/salaryStructure.model');
const Attendance = require('../models/attendance.model');
const User = require('../models/user.model');
const EmployeeProfile = require('../models/employeeProfile.model');
const { calculateSalary } = require('../utils/salaryCalculator');
const mongoose = require('mongoose');

const createPayrun = async (data, adminId, company) => {
  return Payrun.create({ ...data, processedBy: adminId, company });
};

const processPayroll = async (payrunId, company) => {
  const payrun = await Payrun.findById(payrunId);
  if (!payrun) throw new Error('Payrun not found');
  if (payrun.status !== 'DRAFT') throw new Error('Only draft payruns can be processed');

  payrun.status = 'PROCESSING';
  await payrun.save();

  // Get active employees from this company
  const employees = await User.find({ status: 'ACTIVE', company });
  let totalAmount = 0;
  let processedCount = 0;

  for (const emp of employees) {
    const structure = await SalaryStructure.findOne({ employee: emp._id });
    if (!structure) continue;

    const startDate = new Date(payrun.year, payrun.month - 1, 1);
    const endDate = new Date(payrun.year, payrun.month, 0);
    const attendanceRecords = await Attendance.find({
      employee: emp._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const totalDaysInMonth = endDate.getDate();
    const presentDays = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const lopDays = Math.max(0, totalDaysInMonth - presentDays - 8); // subtract weekends approx

    const calculation = calculateSalary({
      baseSalary: structure.baseSalary,
      allowances: structure.allowances,
      deductions: structure.deductions,
      attendance: { totalDays: totalDaysInMonth, lopDays },
      statutory: structure.statutory,
    });

    totalAmount += calculation.netSalary;
    processedCount++;
  }

  payrun.totalEmployees = processedCount;
  payrun.totalAmount = totalAmount;
  payrun.status = 'COMPLETED';
  await payrun.save();

  return payrun;
};

const finalizePayrun = async (payrunId, adminId, company) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payrun = await Payrun.findById(payrunId).session(session);
    if (!payrun) throw new Error('Payrun not found');
    if (payrun.status !== 'COMPLETED') throw new Error('Payrun must be in COMPLETED status to finalize');

    const employees = await User.find({ status: 'ACTIVE', company }).session(session);

    for (const emp of employees) {
      const structure = await SalaryStructure.findOne({ employee: emp._id }).session(session);
      if (!structure) continue;

      const startDate = new Date(payrun.year, payrun.month - 1, 1);
      const endDate = new Date(payrun.year, payrun.month, 0);
      const attendanceRecords = await Attendance.find({
        employee: emp._id,
        date: { $gte: startDate, $lte: endDate }
      }).session(session);

      const totalDaysInMonth = endDate.getDate();
      const presentDays = attendanceRecords.filter(a => a.status === 'PRESENT').length;
      const lopDays = Math.max(0, totalDaysInMonth - presentDays - 8);

      const calc = calculateSalary({
        baseSalary: structure.baseSalary,
        allowances: structure.allowances,
        deductions: structure.deductions,
        attendance: { totalDays: totalDaysInMonth, lopDays },
        statutory: structure.statutory,
      });

      await Payslip.create([{
        employee: emp._id,
        payrun: payrunId,
        month: payrun.month,
        year: payrun.year,
        salarySnapshot: {
          baseSalary: structure.baseSalary,
          allowances: structure.allowances,
          deductions: structure.deductions,
          statutory: structure.statutory,
          breakdown: calc.statutory, // Store PF/PT breakdown
        },
        attendanceSnapshot: {
          totalDays: totalDaysInMonth,
          presentDays,
          absentDays: attendanceRecords.filter(a => a.status === 'ABSENT').length,
          lopDays,
        },
        grossSalary: calc.grossSalary,
        totalDeductions: calc.totalDeductions,
        netSalary: calc.netSalary,
        status: 'GENERATED',
      }], { session });
    }

    payrun.status = 'FINALIZED';
    payrun.finalizedAt = new Date();
    await payrun.save({ session });

    await session.commitTransaction();
    return payrun;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getPayruns = async (company) => {
  const match = company === 'Default Company' 
    ? { $or: [{ company: 'Default Company' }, { company: { $exists: false } }, { company: null }] }
    : { company };
  return Payrun.find(match).sort({ year: -1, month: -1 });
};

const getPayrunWithSlips = async (payrunId) => {
  const payrun = await Payrun.findById(payrunId);
  if (!payrun) throw new Error('Payrun not found');

  const payslips = await Payslip.find({ payrun: payrunId })
    .populate('employee', 'email')
    .lean();

  // Enrich with employee names
  const enriched = await Promise.all(payslips.map(async (slip) => {
    const profile = await EmployeeProfile.findOne({ user: slip.employee._id })
      .select('firstName lastName employeeId department').lean();
    return {
      ...slip,
      employeeName: profile ? `${profile.firstName} ${profile.lastName}` : slip.employee.email,
      employeeCode: profile?.employeeId || '—',
      department: profile?.department || '—',
    };
  }));

  return { payrun, payslips: enriched };
};

/** Dashboard stats for payroll overview */
const getPayrollDashboard = async (company) => {
  // Base query for users in this company
  const companyMatch = company === 'Default Company' 
    ? { $or: [{ company: 'Default Company' }, { company: { $exists: false } }, { company: null }] }
    : { company };

  const allUsers = await User.find({ ...companyMatch, status: 'ACTIVE' });
  const userIds = allUsers.map(u => u._id);

  // Optimized lookup: get all relevant profiles and structures in bulk
  const [profiles, structures] = await Promise.all([
    EmployeeProfile.find({ user: { $in: userIds } }),
    SalaryStructure.find({ employee: { $in: userIds } })
  ]);

  const profileMap = new Map(profiles.map(p => [p.user.toString(), p]));
  const structureMap = new Map(structures.map(s => [s.employee.toString(), s]));
  
  const withoutBank = profiles.filter(p => !p.bankDetails?.accountNumber).length;
  const withoutSalary = allUsers.filter(u => !structureMap.has(u._id.toString())).length;

  // Recent payruns
  const recentPayruns = await Payrun.find(companyMatch).sort({ year: -1, month: -1 }).limit(5).lean();
  const payrunsWithCount = await Promise.all(recentPayruns.map(async (pr) => {
    const slipCount = await Payslip.countDocuments({ payrun: pr._id });
    return { ...pr, payslipCount: slipCount };
  }));

  // Monthly cost data (last 6 months)
  const now = new Date();
  const monthlyCosts = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const payrun = await Payrun.findOne({ ...companyMatch, month: m, year: y, status: 'FINALIZED' });
    monthlyCosts.push({
      month: m,
      year: y,
      label: d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      totalAmount: payrun ? parseFloat(payrun.totalAmount?.toString() || '0') : 0,
      employees: payrun ? payrun.totalEmployees : 0,
    });
  }

  return {
    warnings: {
      withoutBank,
      withoutSalary,
    },
    recentPayruns: payrunsWithCount,
    monthlyCosts,
    totalEmployees: allUsers.length,
  };
};

module.exports = {
  createPayrun,
  processPayroll,
  finalizePayrun,
  getPayruns,
  getPayrunWithSlips,
  getPayrollDashboard,
};
