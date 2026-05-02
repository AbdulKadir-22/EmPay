const Payslip = require('../models/payslip.model');
const User = require('../models/user.model');
const resend = require('../config/mail');
const { generatePayslipPDF } = require('../utils/pdfGenerator');

const getMyPayslips = async (userId) => {
  return Payslip.find({ employee: userId }).sort({ year: -1, month: -1 });
};

const getPayslipById = async (id) => {
  return Payslip.findById(id).populate('employee', 'firstName lastName email');
};

const generateAndUploadPDF = async (payslipId) => {
  const payslip = await Payslip.findById(payslipId);
  if (!payslip) throw new Error('Payslip not found');

  const pdfUrl = await generatePayslipPDF(payslip);
  payslip.pdfUrl = pdfUrl;
  await payslip.save();
  
  return payslip;
};

const sendPayslipEmail = async (payslipId) => {
  const payslip = await Payslip.findById(payslipId).populate('employee');
  if (!payslip) throw new Error('Payslip not found');

  const { email, firstName } = payslip.employee;

  await resend.emails.send({
    from: 'EmPay Payroll <payroll@resend.dev>',
    to: email,
    subject: `Your Payslip for ${payslip.month}/${payslip.year}`,
    html: `
      <h1>Hello ${firstName},</h1>
      <p>Your payslip for <strong>${payslip.month}/${payslip.year}</strong> has been generated.</p>
      <p><strong>Net Salary:</strong> ${payslip.netSalary}</p>
      <p>You can view or download your payslip from the EmPay portal.</p>
      ${payslip.pdfUrl ? `<p><a href="${payslip.pdfUrl}">Download PDF</a></p>` : ''}
    `,
  });

  return { success: true };
};

const getAllPayslips = async (query = {}) => {
  return Payslip.find(query).populate('employee', 'firstName lastName email');
};

module.exports = {
  getMyPayslips,
  getPayslipById,
  generateAndUploadPDF,
  sendPayslipEmail,
  getAllPayslips,
};
