import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Save, Plus, Trash2, 
  DollarSign, PieChart, ShieldCheck, 
  Info, Loader2, AlertCircle, CheckCircle 
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { payrollAPI, userAPI } from '../services/api';

const SalarySetup = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    baseSalary: 0,
    effectiveFrom: new Date().toISOString().split('T')[0],
    allowances: [
      { name: 'House Rent Allowance', amount: 0, rateType: 'PERCENTAGE', percentageOf: 'BASE' },
      { name: 'Standard Allowance', amount: 0, rateType: 'FIXED' },
    ],
    deductions: [],
    statutory: {
      pfEnabled: true,
      ptEnabled: true,
      esiEnabled: false,
      tdsEnabled: false,
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, salaryRes] = await Promise.all([
          userAPI.getProfile(userId),
          payrollAPI.getSalaryStructure(userId)
        ]);
        
        const profileData = profileRes.data.data;
        setEmployee(profileData.profile || { firstName: profileData.email, lastName: '' });
        
        if (salaryRes.data.data.structure) {
          const s = salaryRes.data.data.structure;
          setFormData(prev => ({
            ...prev,
            ...s,
            statutory: {
              ...prev.statutory,
              ...(s.statutory || {})
            },
            effectiveFrom: s.effectiveFrom ? new Date(s.effectiveFrom).toISOString().split('T')[0] : prev.effectiveFrom
          }));
        }
      } catch (err) {
        console.error('Salary Setup Error:', err);
        setError(err.response?.data?.message || 'Failed to load salary details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addRow = (type) => {
    const newRow = { name: '', amount: 0, rateType: 'FIXED' };
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], newRow]
    }));
  };

  const removeRow = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const updateRow = (type, index, field, value) => {
    const updated = [...formData[type]];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, [type]: updated }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        baseSalary: Number(formData.baseSalary),
        allowances: formData.allowances.filter(a => a.name.trim() !== ''),
        deductions: formData.deductions.filter(d => d.name.trim() !== ''),
        effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
      };
      
      await payrollAPI.updateSalaryStructure(userId, dataToSave);
      showToast('Salary structure updated successfully');
      
      // Update local state with cleaned data
      setFormData(prev => ({
        ...prev,
        allowances: dataToSave.allowances,
        deductions: dataToSave.deductions
      }));
    } catch (err) {
      console.error('Save error:', err);
      const detail = err.response?.data?.error?.details?.[0]?.message || err.response?.data?.message || 'Validation Failed';
      showToast(detail, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Live Computation
  const calculateGross = () => {
    const base = Number(formData.baseSalary) || 0;
    const allowances = formData.allowances.reduce((acc, curr) => {
      const amt = Number(curr.amount) || 0;
      return acc + (curr.rateType === 'PERCENTAGE' ? (base * (amt / 100)) : amt);
    }, 0);
    return base + allowances;
  };

  const calculateDeductions = () => {
    const gross = calculateGross();
    const base = Number(formData.baseSalary) || 0;
    
    let statutoryTotal = 0;
    if (formData.statutory.pfEnabled) statutoryTotal += base * 0.12;
    if (formData.statutory.ptEnabled) statutoryTotal += (gross > 10000 ? 200 : 0);
    if (formData.statutory.esiEnabled && gross <= 21000) statutoryTotal += gross * 0.0075;
    if (formData.statutory.tdsEnabled && gross > 30000) statutoryTotal += gross * 0.1;
    
    const others = formData.deductions.reduce((acc, curr) => {
      const amt = Number(curr.amount) || 0;
      return acc + (curr.rateType === 'PERCENTAGE' ? (gross * (amt / 100)) : amt);
    }, 0);
    
    return statutoryTotal + others;
  };

  const gross = calculateGross();
  const deductions = calculateDeductions();
  const net = gross - deductions;

  if (error) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={28} className="text-red-500 mb-3" />
        <p className="text-brand-text font-medium">{error}</p>
        <button 
          onClick={() => navigate('/dashboard/payroll')}
          className="mt-4 text-sm text-brand-purple hover:underline"
        >
          Go back to Payroll
        </button>
      </div>
    </DashboardLayout>
  );

  if (loading) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-brand-purple animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-10 left-1/2 z-[100] flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium
              ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}
          >
            {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard/payroll')}
              className="p-2 rounded-xl bg-brand-surface border border-border text-brand-muted hover:text-brand-text transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-brand-text font-syne">Salary Setup</h1>
              <p className="text-sm text-brand-muted">Configure structure for {employee?.firstName} {employee?.lastName}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-purple text-white rounded-xl font-bold shadow-lg shadow-brand-purple/20 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            SAVE STRUCTURE
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <section className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-brand-purple/10 text-brand-purple">
                  <DollarSign size={20} />
                </div>
                <h3 className="font-bold text-brand-text font-syne">Basic Salary</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-muted uppercase">Monthly Base</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted">₹</span>
                    <input 
                      type="number"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 bg-brand-bg border border-border rounded-xl text-brand-text focus:border-brand-purple outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-muted uppercase">Effective From</label>
                  <input 
                    type="date"
                    value={formData.effectiveFrom}
                    onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                    className="w-full px-4 py-3 bg-brand-bg border border-border rounded-xl text-brand-text focus:border-brand-purple outline-none transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Allowances */}
            <section className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Plus size={20} />
                  </div>
                  <h3 className="font-bold text-brand-text font-syne">Allowances (Earnings)</h3>
                </div>
                <button 
                  onClick={() => addRow('allowances')}
                  className="text-xs font-bold text-brand-purple hover:underline"
                >
                  + Add Component
                </button>
              </div>
              <div className="space-y-4">
                {formData.allowances.map((row, idx) => (
                  <div key={idx} className="flex items-end gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex-1 space-y-1.5">
                      <input 
                        placeholder="Rule Name (e.g. HRA)"
                        value={row.name}
                        onChange={(e) => updateRow('allowances', idx, 'name', e.target.value)}
                        className="w-full px-4 py-2.5 bg-brand-bg border border-border rounded-xl text-sm"
                      />
                    </div>
                    <div className="w-28 space-y-1.5">
                      <select 
                        value={row.rateType}
                        onChange={(e) => updateRow('allowances', idx, 'rateType', e.target.value)}
                        className="w-full px-2 py-2.5 bg-brand-bg border border-border rounded-xl text-xs"
                      >
                        <option value="FIXED">Fixed (₹)</option>
                        <option value="PERCENTAGE">% of Base</option>
                      </select>
                    </div>
                    <div className="w-32 space-y-1.5">
                      <input 
                        type="number"
                        value={row.amount}
                        onChange={(e) => updateRow('allowances', idx, 'amount', e.target.value)}
                        className="w-full px-4 py-2.5 bg-brand-bg border border-border rounded-xl text-sm font-medium"
                      />
                    </div>
                    <button 
                      onClick={() => removeRow('allowances', idx)}
                      className="p-2.5 text-brand-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Deductions */}
            <section className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                    <Trash2 size={20} />
                  </div>
                  <h3 className="font-bold text-brand-text font-syne">Deductions</h3>
                </div>
                <button 
                  onClick={() => addRow('deductions')}
                  className="text-xs font-bold text-brand-purple hover:underline"
                >
                  + Add Deduction
                </button>
              </div>
              <div className="space-y-4">
                {formData.deductions.map((row, idx) => (
                  <div key={idx} className="flex items-end gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex-1 space-y-1.5">
                      <input 
                        placeholder="Deduction Name"
                        value={row.name}
                        onChange={(e) => updateRow('deductions', idx, 'name', e.target.value)}
                        className="w-full px-4 py-2.5 bg-brand-bg border border-border rounded-xl text-sm"
                      />
                    </div>
                    <div className="w-28 space-y-1.5">
                      <select 
                        value={row.rateType}
                        onChange={(e) => updateRow('deductions', idx, 'rateType', e.target.value)}
                        className="w-full px-2 py-2.5 bg-brand-bg border border-border rounded-xl text-xs"
                      >
                        <option value="FIXED">Fixed (₹)</option>
                        <option value="PERCENTAGE">% of Gross</option>
                      </select>
                    </div>
                    <div className="w-32 space-y-1.5">
                      <input 
                        type="number"
                        value={row.amount}
                        onChange={(e) => updateRow('deductions', idx, 'amount', e.target.value)}
                        className="w-full px-4 py-2.5 bg-brand-bg border border-border rounded-xl text-sm font-medium"
                      />
                    </div>
                    <button 
                      onClick={() => removeRow('deductions', idx)}
                      className="p-2.5 text-brand-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {formData.deductions.length === 0 && (
                  <p className="text-xs text-brand-muted italic">No custom deductions added.</p>
                )}
              </div>
            </section>
          </div>

          {/* Computation Summary */}
          <div className="space-y-6">
            <section className="glass-card rounded-2xl p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-brand-green/10 text-brand-green">
                  <PieChart size={20} />
                </div>
                <h3 className="font-bold text-brand-text font-syne">Computation</h3>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Base Salary</span>
                  <span className="font-semibold text-brand-text">₹{Number(formData.baseSalary).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Total Allowances</span>
                  <span className="font-semibold text-emerald-500">+ ₹{(gross - formData.baseSalary).toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between font-bold">
                  <span className="text-brand-text">Gross Salary</span>
                  <span className="text-brand-text">₹{gross.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-red-500">
                  <span>Total Deductions</span>
                  <span>- ₹{deductions.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t-2 border-dashed border-border flex justify-between font-extrabold text-lg">
                  <span className="text-brand-purple">Net Pay</span>
                  <span className="text-brand-purple font-syne">₹{net.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 bg-brand-bg/50 p-4 rounded-xl border border-border">
                <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-2">Statutory Controls</h4>
                <StatToggle 
                  label="Provident Fund (PF)" 
                  checked={formData.statutory.pfEnabled}
                  onChange={(val) => setFormData({ ...formData, statutory: { ...formData.statutory, pfEnabled: val } })}
                />
                <StatToggle 
                  label="Professional Tax (PT)" 
                  checked={formData.statutory.ptEnabled}
                  onChange={(val) => setFormData({ ...formData, statutory: { ...formData.statutory, ptEnabled: val } })}
                />
                <StatToggle 
                  label="ESI Contribution" 
                  checked={formData.statutory.esiEnabled}
                  onChange={(val) => setFormData({ ...formData, statutory: { ...formData.statutory, esiEnabled: val } })}
                />
                <StatToggle 
                  label="Income Tax (TDS)" 
                  checked={formData.statutory.tdsEnabled}
                  onChange={(val) => setFormData({ ...formData, statutory: { ...formData.statutory, tdsEnabled: val } })}
                />
              </div>

              <div className="mt-6 flex gap-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-500 leading-tight">
                  Calculations are based on monthly totals. Attendance impact (LOP) will be applied during payrun execution.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatToggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-brand-text font-medium">{label}</span>
    <button 
      onClick={() => onChange(!checked)}
      className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-brand-purple' : 'bg-gray-300'}`}
    >
      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'left-4.5' : 'left-0.5'}`} />
    </button>
  </div>
);

export default SalarySetup;
