const payslipService = require('../services/payslip.service');
const asyncHandler = require('../utils/asyncHandler');
const { formatResponse } = require('../utils/response.util');

const getMyPayslips = asyncHandler(async (req, res) => {
  const payslips = await payslipService.getMyPayslips(req.user._id);
  res.status(200).json(
    formatResponse(true, 'Your payslips fetched', { payslips }, null, req)
  );
});

const getPayslip = asyncHandler(async (req, res) => {
  const payslip = await payslipService.getPayslipById(req.params.id);
  
  // Security check: Only owner or HR/Admin
  if (payslip.employee._id.toString() !== req.user._id.toString() && !['ADMIN', 'HR'].includes(req.user.role)) {
    throw new Error('Not authorized to view this payslip');
  }

  res.status(200).json(
    formatResponse(true, 'Payslip fetched', { payslip }, null, req)
  );
});

const sendEmail = asyncHandler(async (req, res) => {
  await payslipService.sendPayslipEmail(req.params.id);
  res.status(200).json(
    formatResponse(true, 'Payslip email sent', null, null, req)
  );
});

const generatePDF = asyncHandler(async (req, res) => {
  const payslip = await payslipService.generateAndUploadPDF(req.params.id);
  res.status(200).json(
    formatResponse(true, 'PDF generated', { payslip }, null, req)
  );
});

const getAll = asyncHandler(async (req, res) => {
  const payslips = await payslipService.getAllPayslips(req.query);
  res.status(200).json(
    formatResponse(true, 'Payslips fetched', { payslips }, null, req)
  );
});

module.exports = {
  getMyPayslips,
  getPayslip,
  sendEmail,
  generatePDF,
  getAll,
};
