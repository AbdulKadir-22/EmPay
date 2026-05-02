/**
 * PDF Generator Utility
 * Mock implementation returning a dummy URL/Path
 */

const generatePayslipPDF = async (payslipData) => {
  // In a real implementation, you would use puppeteer or pdfkit here
  // For this build, we return a mock URL
  const mockUrl = `https://storage.empay.com/payslips/${payslipData.employee}_${payslipData.month}_${payslipData.year}.pdf`;
  
  console.log(`📄 Generating PDF for ${payslipData.employee} - ${payslipData.month}/${payslipData.year}`);
  
  return mockUrl;
};

module.exports = { generatePayslipPDF };
