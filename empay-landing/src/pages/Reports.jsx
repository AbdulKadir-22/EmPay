import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Printer, Loader2, AlertCircle, FileText } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { reportAPI } from '../services/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const Reports = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [empLoading, setEmpLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef(null);

  // Load employees for dropdown
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await reportAPI.getEmployees();
        setEmployees(res.data.data.employees || []);
      } catch {
        setError('Failed to load employees');
      } finally {
        setEmpLoading(false);
      }
    };
    fetch();
  }, []);

  // Auto-fetch when both selected
  useEffect(() => {
    if (!selectedEmployee || !selectedYear) {
      setStatement(null);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await reportAPI.getSalaryStatement(selectedEmployee, selectedYear);
        setStatement(res.data.data.statement);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to generate report');
        setStatement(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedEmployee, selectedYear]);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Salary Statement - ${statement.employee.firstName} ${statement.employee.lastName} - ${statement.year}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a2e; padding: 32px; }
          .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 3px solid #7c3aed; margin-bottom: 24px; }
          .logo { font-size: 22px; font-weight: 800; color: #7c3aed; }
          .logo-sub { font-size: 10px; color: #888; }
          .title { font-size: 16px; color: #7c3aed; font-weight: 700; }
          .subtitle { font-size: 11px; color: #666; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 32px; margin-bottom: 20px; padding: 12px 16px; background: #f9f5ff; border-radius: 8px; border: 1px solid #e9d5ff; }
          .info-pair { display: flex; gap: 8px; font-size: 11px; }
          .info-label { color: #888; min-width: 110px; }
          .info-value { color: #1a1a2e; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
          th { background: #7c3aed; color: white; padding: 8px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          th.right { text-align: right; }
          td { padding: 6px 12px; border-bottom: 1px solid #eee; }
          td.right { text-align: right; font-family: 'Consolas', monospace; }
          tr:nth-child(even) { background: #faf8ff; }
          .totals-row td { font-weight: 700; border-top: 2px solid #7c3aed; background: #f3f0ff; }
          .net-box { background: linear-gradient(135deg, #f3f0ff 0%, #e8faf5 100%); border: 2px solid #7c3aed; border-radius: 8px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
          .net-label { font-size: 13px; font-weight: 700; }
          .net-sub { font-size: 9px; color: #888; }
          .net-amount { font-size: 22px; font-weight: 800; color: #7c3aed; font-family: 'Consolas', monospace; }
          .net-words { font-size: 10px; color: #7c3aed; font-style: italic; margin-top: 8px; }
          .attendance-box { margin-bottom: 16px; }
          .att-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
          .att-item { text-align: center; padding: 8px; background: #f9f5ff; border-radius: 6px; border: 1px solid #e9d5ff; }
          .att-num { font-size: 18px; font-weight: 700; color: #7c3aed; }
          .att-label { font-size: 9px; color: #888; text-transform: uppercase; }
          .footer { margin-top: 32px; text-align: center; font-size: 9px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
          @media print { body { padding: 16px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
        <div class="footer">This is a system-generated report from EmPay HRMS. No signature required.</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
  };

  const d = (v) => parseFloat(v || 0);
  const fmt = (n) => `₹${d(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // Year options (current year + 2 previous)
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-brand-purple" />
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-text font-syne">Reports</h1>
          </div>
        </motion.div>
      </div>

      {/* Report Type + Print */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <h2 className="text-lg font-bold text-brand-text font-syne">Salary Statement Report</h2>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePrint}
            disabled={!statement}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-purple text-white text-sm font-semibold rounded-xl
              hover:bg-brand-purple/90 shadow-lg shadow-brand-purple/20 transition-colors cursor-pointer
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer size={16} /> Print
          </motion.button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-muted">Employee Name</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              disabled={empLoading}
              className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text
                focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all
                cursor-pointer appearance-none disabled:opacity-50"
            >
              <option value="">Select employee...</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} {emp.employeeId ? `(${emp.employeeId})` : ''} — {emp.department || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-muted">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text
                focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all
                cursor-pointer appearance-none"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Loading / Error / Empty */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" />
          <p className="text-brand-muted text-sm mt-4">Generating report...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle size={28} className="text-red-500 mb-3" />
          <p className="text-brand-text font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && !statement && selectedEmployee && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-brand-muted">
          <FileText size={40} className="mb-4 opacity-30" />
          <p className="text-sm">No payslip data found for this employee and year.</p>
        </div>
      )}

      {!loading && !error && !selectedEmployee && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-brand-muted">
          <FileText size={40} className="mb-4 opacity-30" />
          <p className="text-sm">Select an employee and year to generate the salary statement report.</p>
        </div>
      )}

      {/* Report Content (both visible + printable) */}
      {statement && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* On-screen card (styled for dashboard) */}
          <div className="glass-card rounded-2xl p-6 overflow-x-auto">
            <div ref={printRef}>
              {/* Print Header */}
              <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '3px solid #7c3aed', marginBottom: '20px' }}>
                <div>
                  <div className="logo" style={{ fontSize: '22px', fontWeight: 800, color: '#7c3aed' }}>EmPay</div>
                  <div className="logo-sub" style={{ fontSize: '10px', color: '#888' }}>HRMS & Payroll</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="title" style={{ fontSize: '16px', color: '#7c3aed', fontWeight: 700 }}>Salary Statement Report</div>
                  <div className="subtitle" style={{ fontSize: '12px', color: '#666' }}>Financial Year {statement.year}</div>
                </div>
              </div>

              {/* Employee Info */}
              <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 32px', marginBottom: '20px', padding: '12px 16px', background: '#f9f5ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                <InfoPair label="Employee Name" value={`${statement.employee.firstName} ${statement.employee.lastName}`} />
                <InfoPair label="PAN" value={statement.employee.governmentIds?.pan || '—'} />
                <InfoPair label="Employee Code" value={statement.employee.employeeId || '—'} />
                <InfoPair label="Department" value={statement.employee.department || '—'} />
                <InfoPair label="Designation" value={statement.employee.designation || '—'} />
                <InfoPair label="Bank A/c" value={statement.employee.bankDetails?.accountNumber || '—'} />
              </div>

              {/* Attendance Summary */}
              <div className="attendance-box" style={{ marginBottom: '16px' }}>
                <div className="att-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <AttBox label="Present Days" value={statement.attendance.totalPresent} />
                  <AttBox label="Absent Days" value={statement.attendance.totalAbsent} />
                  <AttBox label="Leave Days" value={statement.attendance.totalLeave} />
                  <AttBox label="Total Records" value={statement.attendance.totalRecords} />
                </div>
              </div>

              {/* Monthly Breakdown Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th style={{ background: '#7c3aed', color: 'white', padding: '8px 12px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Month</th>
                    <th className="right" style={{ background: '#7c3aed', color: 'white', padding: '8px 12px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Basic</th>
                    <th className="right" style={{ background: '#7c3aed', color: 'white', padding: '8px 12px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gross</th>
                    <th className="right" style={{ background: '#7c3aed', color: 'white', padding: '8px 12px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deductions</th>
                    <th className="right" style={{ background: '#7c3aed', color: 'white', padding: '8px 12px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net</th>
                    <th style={{ background: '#7c3aed', color: 'white', padding: '8px 12px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Days</th>
                    <th style={{ background: '#7c3aed', color: 'white', padding: '8px 12px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {statement.payslips.map((p, i) => (
                    <tr key={p._id} style={{ background: i % 2 === 0 ? '#fff' : '#faf8ff' }}>
                      <td style={{ padding: '6px 12px', borderBottom: '1px solid #eee', fontWeight: 600 }}>{FULL_MONTHS[p.month - 1]} {p.year}</td>
                      <td className="right" style={{ padding: '6px 12px', borderBottom: '1px solid #eee', textAlign: 'right', fontFamily: 'Consolas, monospace' }}>{fmt(p.baseSalary)}</td>
                      <td className="right" style={{ padding: '6px 12px', borderBottom: '1px solid #eee', textAlign: 'right', fontFamily: 'Consolas, monospace' }}>{fmt(p.grossSalary)}</td>
                      <td className="right" style={{ padding: '6px 12px', borderBottom: '1px solid #eee', textAlign: 'right', fontFamily: 'Consolas, monospace', color: '#dc2626' }}>-{fmt(p.totalDeductions)}</td>
                      <td className="right" style={{ padding: '6px 12px', borderBottom: '1px solid #eee', textAlign: 'right', fontFamily: 'Consolas, monospace', fontWeight: 700 }}>{fmt(p.netSalary)}</td>
                      <td style={{ padding: '6px 12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>{p.attendanceSnapshot?.presentDays || '—'}/{p.attendanceSnapshot?.totalDays || '—'}</td>
                      <td style={{ padding: '6px 12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, background: p.status === 'GENERATED' ? '#d1fae5' : '#e5e7eb', color: p.status === 'GENERATED' ? '#059669' : '#6b7280' }}>
                          {p.status === 'GENERATED' ? 'Done' : p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="totals-row" style={{ fontWeight: 700, borderTop: '2px solid #7c3aed', background: '#f3f0ff' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>YEARLY TOTAL</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'Consolas, monospace' }}>—</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'Consolas, monospace', fontWeight: 700 }}>{fmt(statement.totals.yearlyGross)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'Consolas, monospace', color: '#dc2626', fontWeight: 700 }}>-{fmt(statement.totals.yearlyDeductions)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'Consolas, monospace', fontWeight: 700, color: '#7c3aed' }}>{fmt(statement.totals.yearlyNet)}</td>
                    <td style={{ padding: '8px 12px' }}></td>
                    <td style={{ padding: '8px 12px' }}></td>
                  </tr>
                </tbody>
              </table>

              {/* Net Payable Summary */}
              <div className="net-box" style={{ background: 'linear-gradient(135deg, #f3f0ff 0%, #e8faf5 100%)', border: '2px solid #7c3aed', borderRadius: '8px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="net-label" style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>Total Yearly Net Payable</div>
                  <div className="net-sub" style={{ fontSize: '10px', color: '#888' }}>(Sum of all monthly net salaries for {statement.year})</div>
                </div>
                <div className="net-amount" style={{ fontSize: '24px', fontWeight: 800, color: '#7c3aed', fontFamily: 'Consolas, monospace' }}>
                  {fmt(statement.totals.yearlyNet)}
                </div>
              </div>
              <div className="net-words" style={{ fontSize: '11px', color: '#7c3aed', fontStyle: 'italic', marginTop: '8px' }}>
                {numberToWords(statement.totals.yearlyNet)}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
};

/* Helper: inline info pair for print compatibility */
const InfoPair = ({ label, value }) => (
  <div className="info-pair" style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
    <span className="info-label" style={{ color: '#888', minWidth: '110px' }}>{label}</span>
    <span style={{ color: '#888' }}>:</span>
    <span className="info-value" style={{ color: '#1a1a2e', fontWeight: 600 }}>{value || '—'}</span>
  </div>
);

/* Helper: attendance box */
const AttBox = ({ label, value }) => (
  <div className="att-item" style={{ textAlign: 'center', padding: '8px', background: '#f9f5ff', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
    <div className="att-num" style={{ fontSize: '18px', fontWeight: 700, color: '#7c3aed' }}>{value}</div>
    <div className="att-label" style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>{label}</div>
  </div>
);

/* Number to words (Indian format) */
const numberToWords = (n) => {
  if (!n || n === 0) return 'Zero Rupees Only';
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

export default Reports;
