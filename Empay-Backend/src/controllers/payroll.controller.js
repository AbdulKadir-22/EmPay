const payrunService = require('../services/payrun.service');
const salaryService = require('../services/salary.service');
const asyncHandler = require('../utils/asyncHandler');
const { formatResponse } = require('../utils/response.util');

const createPayrun = asyncHandler(async (req, res) => {
  const payrun = await payrunService.createPayrun(req.body, req.user._id, req.user.company);
  res.status(201).json(
    formatResponse(true, 'Payrun created successfully', { payrun }, null, req)
  );
});

const processPayroll = asyncHandler(async (req, res) => {
  const payrun = await payrunService.processPayroll(req.params.payrunId, req.user.company);
  res.status(200).json(
    formatResponse(true, 'Payroll processing completed', { payrun }, null, req)
  );
});

const finalizePayrun = asyncHandler(async (req, res) => {
  const payrun = await payrunService.finalizePayrun(req.params.payrunId, req.user._id, req.user.company);
  res.status(200).json(
    formatResponse(true, 'Payrun finalized and locked', { payrun }, null, req)
  );
});

const getPayruns = asyncHandler(async (req, res) => {
  const payruns = await payrunService.getPayruns(req.user.company);
  res.status(200).json(
    formatResponse(true, 'Payruns fetched', { payruns }, null, req)
  );
});

const getPayrunWithSlips = asyncHandler(async (req, res) => {
  const data = await payrunService.getPayrunWithSlips(req.params.payrunId);
  res.status(200).json(
    formatResponse(true, 'Payrun details fetched', data, null, req)
  );
});

const getPayrollDashboard = asyncHandler(async (req, res) => {
  const dashboard = await payrunService.getPayrollDashboard(req.user.company);
  res.status(200).json(
    formatResponse(true, 'Payroll dashboard fetched', { dashboard }, null, req)
  );
});

const updateSalaryStructure = asyncHandler(async (req, res) => {
  const structure = await salaryService.updateSalaryStructure(req.params.userId, req.body);
  res.status(200).json(
    formatResponse(true, 'Salary structure updated', { structure }, null, req)
  );
});

const getSalaryStructure = asyncHandler(async (req, res) => {
  const structure = await salaryService.getSalaryStructure(req.params.userId || req.user._id);
  res.status(200).json(
    formatResponse(true, 'Salary structure fetched', { structure }, null, req)
  );
});

module.exports = {
  createPayrun,
  processPayroll,
  finalizePayrun,
  getPayruns,
  getPayrunWithSlips,
  getPayrollDashboard,
  updateSalaryStructure,
  getSalaryStructure,
};
