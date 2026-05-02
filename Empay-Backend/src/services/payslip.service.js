const Payslip = require('../models/payslip.model');
const User = require('../models/user.model');

const getMyPayslips = async (userId) => {
  return Payslip.find({ employee: userId }).sort({ year: -1, month: -1 });
};

const getPayslipById = async (id) => {
  const EmployeeProfile = require('../models/employeeProfile.model');
  const payslip = await Payslip.findById(id).populate('employee', 'email').lean();
  if (!payslip) return null;
  const profile = await EmployeeProfile.findOne({ user: payslip.employee._id }).lean();
  return {
    ...payslip,
    employee: {
      ...payslip.employee,
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      employeeId: profile?.employeeId,
      department: profile?.department,
      designation: profile?.designation,
      joiningDate: profile?.joiningDate,
      bankDetails: profile?.bankDetails,
      governmentIds: profile?.governmentIds,
    },
  };
};

const getAllPayslips = async (query = {}) => {
  return Payslip.find(query).populate('employee', 'email');
};

module.exports = {
  getMyPayslips,
  getPayslipById,
  getAllPayslips,
};
