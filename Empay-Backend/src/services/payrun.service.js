const Payrun = require('../models/payrun.model');
const Payslip = require('../models/payslip.model');
const SalaryStructure = require('../models/salaryStructure.model');
const Attendance = require('../models/attendance.model');
const User = require('../models/user.model');
const { calculateSalary } = require('../utils/salaryCalculator');
const mongoose = require('mongoose');

const createPayrun = async (data, adminId) => {
  return Payrun.create({ ...data, processedBy: adminId });
};

const processPayroll = async (payrunId) => {
  const payrun = await Payrun.findById(payrunId);
  if (!payrun) throw new Error('Payrun not found');
  if (payrun.status !== 'DRAFT') throw new Error('Only draft payruns can be processed');

  payrun.status = 'PROCESSING';
  await payrun.save();

  // Get all active employees
  const employees = await User.find({ status: 'ACTIVE', role: 'EMPLOYEE' });
  let totalAmount = 0;
  let processedCount = 0;

  for (const emp of employees) {
    const structure = await SalaryStructure.findOne({ employee: emp._id });
    if (!structure) continue;

    // Fetch attendance for the period to calculate LOP
    const startDate = new Date(payrun.year, payrun.month - 1, 1);
    const endDate = new Date(payrun.year, payrun.month, 0);
    const attendanceRecords = await Attendance.find({
      employee: emp._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const totalDaysInMonth = endDate.getDate();
    const presentDays = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const lopDays = totalDaysInMonth - presentDays; // Simple logic: any day not marked present is LOP (assuming all days are work days for now)

    const calculation = calculateSalary({
      baseSalary: structure.baseSalary,
      allowances: structure.allowances,
      deductions: structure.deductions,
      attendance: { totalDays: totalDaysInMonth, lopDays },
      pfEnabled: structure.pfEnabled,
      taxEnabled: structure.taxEnabled,
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

const finalizePayrun = async (payrunId, adminId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payrun = await Payrun.findById(payrunId).session(session);
    if (!payrun) throw new Error('Payrun not found');
    if (payrun.status !== 'COMPLETED') throw new Error('Payrun must be in COMPLETED status to finalize');

    const employees = await User.find({ status: 'ACTIVE', role: 'EMPLOYEE' }).session(session);

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
      const lopDays = totalDaysInMonth - presentDays;

      const calc = calculateSalary({
        baseSalary: structure.baseSalary,
        allowances: structure.allowances,
        deductions: structure.deductions,
        attendance: { totalDays: totalDaysInMonth, lopDays },
        pfEnabled: structure.pfEnabled,
        taxEnabled: structure.taxEnabled,
      });

      // Generate Payslip (Atomicly)
      await Payslip.create([{
        employee: emp._id,
        payrun: payrunId,
        month: payrun.month,
        year: payrun.year,
        salarySnapshot: {
          baseSalary: structure.baseSalary,
          allowances: structure.allowances,
          deductions: structure.deductions,
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

const getPayruns = async () => {
  return Payrun.find().sort({ year: -1, month: -1 });
};

module.exports = {
  createPayrun,
  processPayroll,
  finalizePayrun,
  getPayruns,
};
