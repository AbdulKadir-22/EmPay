import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Printer } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { payslipAPI } from '../services/api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const PayslipView = () => {
  const { payslipId } = useParams();
  const navigate = useNavigate();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await payslipAPI.getPayslip(payslipId);
        setPayslip(res.data.data.payslip);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load payslip');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [payslipId]);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(`
      <html>
      <head>
        <title>Payslip - ${payslip.employee?.firstName || payslip.employee?.email} - ${MONTHS[payslip.month-1]} ${payslip.year}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #333; }
          .payslip-card { border: 2px solid #7c3aed; border-radius: 16px; overflow: hidden; max-width: 800px; margin: auto; }
          .header { background: #7c3aed; color: white; padding: 24px; display: flex; justify-content: space-between; }
          .info-section { padding: 24px; border-bottom: 1px solid #eee; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; }
          .info-pair { display: flex; gap: 8px; }
          .info-label { color: #666; width: 120px; }
          .info-val { font-weight: bold; }
          .table-container { padding: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; border: 1px solid #eee; }
          th { background: #7c3aed; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #eee; }
          .right { text-align: right; }
          .net-payable { margin: 24px; padding: 20px; background: #f3f0ff; border: 1px solid #7c3aed; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
          .net-amount { font-size: 24px; font-weight: 800; color: #7c3aed; }
          .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #999; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
        <div class="footer">System Generated Payslip - No Signature Required</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-brand-purple" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !payslip) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle size={28} className="text-red-500 mb-3" />
          <p className="text-brand-text font-medium">{error || 'Payslip not found'}</p>
        </div>
      </DashboardLayout>
    );
  }

  const d128 = (v) => parseFloat(v?.$numberDecimal || v || 0);
  const snap = payslip.salarySnapshot || {};
  const attend = payslip.attendanceSnapshot || {};
  const base = d128(snap.baseSalary);
  const gross = d128(payslip.grossSalary);
  const deductions = d128(payslip.totalDeductions);
  const net = d128(payslip.netSalary);
  const emp = payslip.employee || {};

  const startDate = new Date(payslip.year, payslip.month - 1, 1);
  const endDate = new Date(payslip.year, payslip.month, 0);

  // Build earnings and deductions lists
  const earnings = [
    { name: 'Basic Salary', amount: base },
    ...(snap.allowances || []).map(a => ({ name: a.name, amount: d128(a.amount) })),
  ];
  const deductionItems = [
    ...(snap.deductions || []).map(d => ({ name: d.name, amount: d128(d.amount) })),
  ];

  // Add Statutory from breakdown
  if (snap.breakdown) {
    Object.entries(snap.breakdown).forEach(([key, val]) => {
      deductionItems.push({ 
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
        amount: d128(val) 
      });
    });
  }

  const totalEarnings = earnings.reduce((s, e) => s + e.amount, 0);

  // Number to words (simple Indian format)
  const numberToWords = (n) => {
    if (n === 0) return 'Zero';
    const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
      'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    const convert = (num) => {
      if (num < 20) return ones[num];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
      if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convert(num % 100) : '');
      if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convert(num % 1000) : '');
      if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convert(num % 100000) : '');
      return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convert(num % 10000000) : '');
    };
    const intPart = Math.floor(Math.abs(n));
    const decPart = Math.round((Math.abs(n) - intPart) * 100);
    let result = convert(intPart) + ' Rupees';
    if (decPart > 0) result += ' and ' + convert(decPart) + ' Paise';
    return result + ' Only';
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-purple transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2 bg-brand-purple text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-purple/20 transition-all cursor-pointer"
        >
          <Printer size={18} /> PRINT PAYSLIP
        </motion.button>
      </div>

      <motion.div 
        ref={printRef}
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="payslip-card max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-brand-purple/20"
      >
        
        <div className="header bg-gradient-to-r from-brand-purple to-brand-purple/80 p-6">
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-white text-xl font-bold font-syne">EmPay</h2>
              <p className="text-white/70 text-xs mt-0.5">HRMS & Payroll</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Salary Slip</p>
              <p className="text-white text-sm font-semibold">{MONTHS[payslip.month - 1]} {payslip.year}</p>
            </div>
          </div>
        </div>

        <div className="info-section p-6 border-b-2 border-gray-100 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <InfoPair label="Employee Name" value={emp.firstName ? `${emp.firstName} ${emp.lastName || ''}` : emp.email} />
          <InfoPair label="PAN" value={emp.governmentIds?.pan || '—'} />
          <InfoPair label="Employee Code" value={emp.employeeId || '—'} />
          <InfoPair label="UAN" value="—" />
          <InfoPair label="Department" value={emp.department || '—'} />
          <InfoPair label="Bank A/c No." value={emp.bankDetails?.accountNumber || '—'} />
          <InfoPair label="Date of Joining" value={emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN') : '—'} />
          <InfoPair label="Pay Period" value={`${startDate.toLocaleDateString('en-IN')} to ${endDate.toLocaleDateString('en-IN')}`} />
        </div>

        <div className="mx-6 mt-4">
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="bg-brand-purple/90 text-white px-4 py-2 flex justify-between text-xs font-semibold">
              <span>Worked Days Summary</span>
              <span>Number of Days</span>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="px-4 py-2 flex justify-between text-sm text-gray-700">
                <span>Attendance (Present)</span>
                <span className="font-medium">{attend.presentDays || 0}</span>
              </div>
              <div className="px-4 py-2 flex justify-between text-sm text-gray-700">
                <span>Paid Time Off (Leaves)</span>
                <span className="font-medium">{attend.absentDays - attend.lopDays || 0}</span>
              </div>
              <div className="px-4 py-2 flex justify-between text-sm text-red-600">
                <span>LWP / LOP (Unpaid)</span>
                <span className="font-medium">{attend.lopDays || 0}</span>
              </div>
              <div className="px-4 py-2 flex justify-between text-sm text-gray-700 font-semibold bg-gray-50 border-t-2 border-gray-200">
                <span>Total Days in Month</span>
                <span>{attend.totalDays || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="table-container mx-6 mt-4 mb-4">
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="bg-brand-purple/90 text-white grid grid-cols-4 px-4 py-2 text-xs font-semibold">
              <span>Earnings</span>
              <span className="text-right">Amounts</span>
              <span className="pl-4">Deductions</span>
              <span className="text-right">Amounts</span>
            </div>
            <div>
              {Array.from({ length: Math.max(earnings.length, deductionItems.length) }).map((_, i) => (
                <div key={i} className={`grid grid-cols-4 px-4 py-2 text-sm border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                  <span className="text-gray-700">{earnings[i]?.name || ''}</span>
                  <span className="text-right font-mono text-gray-800">{earnings[i] ? `₹${earnings[i].amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''}</span>
                  <span className="pl-4 text-gray-700">{deductionItems[i]?.name || ''}</span>
                  <span className="text-right font-mono text-red-600">{deductionItems[i] ? `- ₹${deductionItems[i].amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''}</span>
                </div>
              ))}
              <div className="grid grid-cols-4 px-4 py-2 border-t-2 border-gray-200 bg-gray-50 font-semibold text-sm">
                <span className="text-gray-800">Gross</span>
                <span className="text-right font-mono text-gray-800">₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="pl-4">Total Ded.</span>
                <span className="text-right font-mono text-red-600">₹{deductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="net-payable mx-6 mb-6">
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">Net Payable Amount</p>
              <p className="text-[11px] text-gray-500 font-medium">({numberToWords(net)})</p>
            </div>
            <div className="text-right">
              <p className="net-amount font-syne">₹{net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

const InfoPair = ({ label, value }) => (
  <div className="flex gap-2">
    <span className="text-gray-500 min-w-[120px]">{label}</span>
    <span className="text-gray-400">:</span>
    <span className="text-gray-800 font-medium">{value || '—'}</span>
  </div>
);

export default PayslipView;
