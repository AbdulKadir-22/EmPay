import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, Play, CheckCircle2, Loader2, AlertCircle, X,
  ArrowLeft, FileText, ChevronRight
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { payrollAPI } from '../services/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const statusConfig = {
  DRAFT: { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Draft' },
  PROCESSING: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Processing' },
  COMPLETED: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Completed' },
  FINALIZED: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Done' },
};

const PayrunPage = () => {
  const navigate = useNavigate();
  const { payrunId } = useParams();
  const [payruns, setPayruns] = useState([]);
  const [selectedPayrun, setSelectedPayrun] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    notes: '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch payruns list
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await payrollAPI.getPayruns();
        setPayruns(res.data.data.payruns || []);
      } catch (err) {
        showToast('Failed to load payruns', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // If payrunId in URL, load that payrun's detail
  useEffect(() => {
    if (payrunId) {
      loadPayrunDetail(payrunId);
    }
  }, [payrunId]);

  const loadPayrunDetail = async (id) => {
    try {
      const res = await payrollAPI.getPayrun(id);
      setSelectedPayrun(res.data.data.payrun);
      setPayslips(res.data.data.payslips || []);
    } catch (err) {
      showToast('Failed to load payrun details', 'error');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const name = formData.name || `Payrun for ${MONTHS[formData.month - 1]} ${formData.year}`;
      await payrollAPI.createPayrun({ ...formData, name });
      showToast('Payrun created!');
      setShowCreate(false);
      setFormData({ name: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), notes: '' });
      const res = await payrollAPI.getPayruns();
      setPayruns(res.data.data.payruns || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create payrun', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcess = async (id) => {
    setActionLoading(true);
    try {
      await payrollAPI.processPayrun(id);
      showToast('Payrun processed!');
      const res = await payrollAPI.getPayruns();
      setPayruns(res.data.data.payruns || []);
      if (payrunId === id) loadPayrunDetail(id);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to process', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalize = async (id) => {
    setActionLoading(true);
    try {
      await payrollAPI.finalizePayrun(id);
      showToast('Payrun finalized! Payslips generated.');
      const res = await payrollAPI.getPayruns();
      setPayruns(res.data.data.payruns || []);
      if (payrunId === id) loadPayrunDetail(id);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to finalize', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const d128 = (v) => parseFloat(v?.$numberDecimal || v || 0);

  // Detail view
  if (payrunId && selectedPayrun) {
    const pr = selectedPayrun;
    const sc = statusConfig[pr.status] || statusConfig.DRAFT;
    const totalGross = payslips.reduce((s, p) => s + d128(p.grossSalary), 0);
    const totalNet = payslips.reduce((s, p) => s + d128(p.netSalary), 0);
    const totalCost = d128(pr.totalAmount);

    return (
      <DashboardLayout>
        <Toast toast={toast} />

        {/* Back + Title */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-3">
            <button onClick={() => navigate('/dashboard/payroll/payrun')} className="p-2 rounded-xl bg-brand-surface border border-border text-brand-muted hover:text-brand-text transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex bg-brand-surface rounded-lg p-0.5 border border-border">
              <button onClick={() => navigate('/dashboard/payroll', { state: { tab: 'dashboard' } })}
                className="px-4 py-1.5 rounded-md text-xs font-medium text-brand-muted hover:text-brand-text transition-all cursor-pointer">
                Dashboard
              </button>
              <button onClick={() => navigate('/dashboard/payroll/payrun')}
                className="px-4 py-1.5 rounded-md text-xs font-medium bg-brand-purple text-white shadow-sm cursor-pointer">
                Payrun
              </button>
              <button onClick={() => navigate('/dashboard/payroll', { state: { tab: 'salary' } })}
                className="px-4 py-1.5 rounded-md text-xs font-medium text-brand-muted hover:text-brand-text transition-all cursor-pointer">
                Salary Setup
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl font-bold text-brand-text font-syne">{pr.name}</h1>
            <div className="flex items-center gap-3">
              {pr.status === 'DRAFT' && (
                <ActionButton onClick={() => handleProcess(pr._id)} loading={actionLoading} icon={Play} label="Process" color="blue" />
              )}
              {pr.status === 'COMPLETED' && (
                <ActionButton onClick={() => handleFinalize(pr._id)} loading={actionLoading} icon={CheckCircle2} label="Finalize" color="emerald" />
              )}
              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard label="Employer Cost" value={`₹${totalCost.toLocaleString('en-IN')}`} />
          <SummaryCard label="Gross" value={`₹${totalGross.toLocaleString('en-IN')}`} />
          <SummaryCard label="Net" value={`₹${totalNet.toLocaleString('en-IN')}`} />
        </div>

        {/* Payslips Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Pay Period</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Employee</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Basic Wage</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Gross Wage</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Net Wage</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payslips.map((slip, i) => {
                  const slipSc = slip.status === 'PAID' ? statusConfig.FINALIZED : statusConfig.COMPLETED;
                  return (
                    <motion.tr
                      key={slip._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => navigate(`/dashboard/payroll/payslip/${slip._id}`)}
                      className="hover:bg-brand-bg/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm text-brand-muted">{MONTHS[slip.month - 1]} {slip.year}</td>
                      <td className="px-6 py-4 text-sm font-medium text-brand-text">{slip.employeeName}</td>
                      <td className="px-6 py-4 text-sm text-brand-text text-right font-mono">₹{d128(slip.salarySnapshot?.baseSalary).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-sm text-brand-text text-right font-mono">₹{d128(slip.grossSalary).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-brand-text text-right font-mono">₹{d128(slip.netSalary).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${slipSc.bg} ${slipSc.text}`}>
                          {slip.status === 'GENERATED' ? 'Done' : slip.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
                {payslips.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-brand-muted">
                      {pr.status === 'FINALIZED' ? 'No payslips found.' : 'Process and finalize the payrun to generate payslips.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  // List view
  return (
    <DashboardLayout>
      <Toast toast={toast} />

      <div className="mb-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-text font-syne">Payrun</h1>
            <div className="flex bg-brand-surface rounded-lg p-0.5 border border-border">
              <button onClick={() => navigate('/dashboard/payroll', { state: { tab: 'dashboard' } })}
                className="px-4 py-1.5 rounded-md text-xs font-medium text-brand-muted hover:text-brand-text transition-all cursor-pointer">
                Dashboard
              </button>
              <button className="px-4 py-1.5 rounded-md text-xs font-medium bg-brand-purple text-white shadow-sm cursor-pointer">
                Payrun
              </button>
              <button onClick={() => navigate('/dashboard/payroll', { state: { tab: 'salary' } })}
                className="px-4 py-1.5 rounded-md text-xs font-medium text-brand-muted hover:text-brand-text transition-all cursor-pointer">
                Salary Setup
              </button>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-xl
              hover:bg-brand-green/90 shadow-lg shadow-brand-green/20 transition-colors cursor-pointer">
            <Plus size={18} /> New Payrun
          </motion.button>
        </motion.div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-card rounded-2xl p-6 shadow-2xl z-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-brand-text font-syne">Create Payrun</h2>
                <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <FormField label="Month">
                  <select value={formData.month} onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text focus:outline-none focus:border-brand-purple transition-all appearance-none cursor-pointer">
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </FormField>
                <FormField label="Year">
                  <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text focus:outline-none focus:border-brand-purple transition-all" />
                </FormField>
                <FormField label="Notes (optional)">
                  <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="e.g. Bonus included"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text focus:outline-none focus:border-brand-purple transition-all" />
                </FormField>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)}
                    className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-brand-muted hover:text-brand-text transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" disabled={actionLoading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-purple text-white text-sm font-semibold hover:bg-brand-purple/90 shadow-lg shadow-brand-purple/20 transition-colors cursor-pointer disabled:opacity-50">
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payruns List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {payruns.map((pr, i) => {
            const sc = statusConfig[pr.status] || statusConfig.DRAFT;
            return (
              <motion.div
                key={pr._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4 hover:border-brand-purple/30 transition-all cursor-pointer"
                onClick={() => navigate(`/dashboard/payroll/payrun/${pr._id}`)}
              >
                <div>
                  <h3 className="text-sm font-bold text-brand-text">{pr.name}</h3>
                  <p className="text-xs text-brand-muted mt-0.5">{pr.totalEmployees || 0} employees • ₹{d128(pr.totalAmount).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-3">
                  {pr.status === 'DRAFT' && (
                    <button onClick={(e) => { e.stopPropagation(); handleProcess(pr._id); }}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-semibold hover:bg-blue-500/20 transition-colors">
                      Process
                    </button>
                  )}
                  {pr.status === 'COMPLETED' && (
                    <button onClick={(e) => { e.stopPropagation(); handleFinalize(pr._id); }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-semibold hover:bg-emerald-500/20 transition-colors">
                      Finalize
                    </button>
                  )}
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span>
                  <ChevronRight size={16} className="text-brand-muted" />
                </div>
              </motion.div>
            );
          })}
          {payruns.length === 0 && (
            <div className="glass-card rounded-2xl p-16 text-center text-brand-muted">
              No payruns created yet. Click "New Payrun" to start.
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

const Toast = ({ toast }) => (
  <AnimatePresence>
    {toast && (
      <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
        className={`fixed top-20 left-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
        {toast.msg}
      </motion.div>
    )}
  </AnimatePresence>
);

const SummaryCard = ({ label, value }) => (
  <div className="glass-card rounded-2xl p-5">
    <p className="text-xs text-brand-muted mb-1">{label}</p>
    <p className="text-xl font-bold text-brand-text font-syne">{value}</p>
  </div>
);

const ActionButton = ({ onClick, loading, icon: Icon, label, color }) => (
  <button onClick={onClick} disabled={loading}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50
      bg-${color}-500/10 text-${color}-500 hover:bg-${color}-500/20`}>
    {loading ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />} {label}
  </button>
);

const FormField = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-brand-muted">{label}</label>
    {children}
  </div>
);

export default PayrunPage;
