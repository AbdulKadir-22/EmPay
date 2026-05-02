import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Loader2, AlertCircle,
  DollarSign, Users, TrendingUp
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { payrollAPI, userAPI } from '../services/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Payroll = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboard, setDashboard] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'dashboard'); // dashboard | payrun | salary

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch dashboard stats first
        const dashRes = await payrollAPI.getDashboard();
        setDashboard(dashRes.data.data.dashboard);
        
        // Then try to fetch employees list for the salary setup tab
        try {
          const empRes = await userAPI.getAll();
          setEmployees(empRes.data.data.users || []);
        } catch (empErr) {
          console.error('Failed to load employees for salary setup:', empErr);
          // Don't set global error, just log it. The dashboard tab will still work.
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load payroll dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" />
          <p className="text-brand-muted text-sm mt-4">Loading payroll...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle size={28} className="text-red-500 mb-3" />
          <p className="text-brand-text font-medium">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const { warnings, recentPayruns, monthlyCosts, totalEmployees } = dashboard || {};
  const maxCost = Math.max(...(monthlyCosts || []).map(c => c.totalAmount), 1);

  return (
    <DashboardLayout>
      {/* Header with tabs */}
      <div className="mb-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-text font-syne">Payroll</h1>
          <div className="flex bg-brand-surface rounded-lg p-0.5 border border-border">
            {['dashboard', 'payrun', 'salary'].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  if (tab === 'payrun') navigate('/dashboard/payroll/payrun');
                  else setActiveTab(tab);
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all capitalize cursor-pointer
                  ${activeTab === tab ? 'bg-brand-purple text-white shadow-sm' : 'text-brand-muted hover:text-brand-text'}`}
              >
                {tab === 'dashboard' ? 'Dashboard' : tab === 'payrun' ? 'Payrun' : 'Salary Setup'}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Top Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Warnings Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6">
              <h3 className="text-sm font-bold text-brand-text font-syne mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                Warning
              </h3>
              <div className="space-y-4">
                <WarningRow 
                  count={warnings?.withoutBank || 0} 
                  text="Employee without Bank A/c" 
                  onClick={() => navigate('/dashboard/settings')} 
                />
                <WarningRow 
                  count={warnings?.withoutSalary || 0} 
                  text="Employee without Salary Structure" 
                  onClick={() => setActiveTab('salary')} 
                />
              </div>
            </motion.div>

            {/* Recent Payruns Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="glass-card rounded-2xl p-6">
              <h3 className="text-sm font-bold text-brand-text font-syne mb-4">Payrun</h3>
              <div className="space-y-2.5">
                {(recentPayruns || []).length > 0 ? recentPayruns.slice(0, 3).map((pr) => (
                  <button
                    key={pr._id}
                    onClick={() => navigate(`/dashboard/payroll/payrun/${pr._id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-bg transition-colors group text-left"
                  >
                    <span className="text-sm text-brand-purple font-medium group-hover:underline">
                      Payrun for {MONTHS[pr.month - 1]} {pr.year} ({pr.payslipCount || 0} Payslip{pr.payslipCount !== 1 ? 's' : ''})
                    </span>
                    <ArrowRight size={14} className="text-brand-muted group-hover:text-brand-purple transition-colors" />
                  </button>
                )) : (
                  <p className="text-sm text-brand-muted">No payruns yet. Create one from the Payrun tab.</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employer Cost Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6">
              <h3 className="text-sm font-bold text-brand-text font-syne mb-6">Employer Cost</h3>
              <div className="flex items-end justify-between gap-3 h-40">
                {(monthlyCosts || []).map((mc, i) => {
                  const height = maxCost > 0 ? Math.max(8, (mc.totalAmount / maxCost) * 100) : 8;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-brand-purple/60 to-brand-purple/20 border border-brand-purple/30 min-h-[8px] relative group"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-brand-surface border border-border px-2 py-1 rounded-lg text-[10px] text-brand-text whitespace-nowrap shadow-lg z-10">
                          ₹{mc.totalAmount.toLocaleString('en-IN')}
                        </div>
                      </motion.div>
                      <span className="text-[10px] text-brand-muted font-medium">{mc.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Employee Count Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-brand-text font-syne">Employee Count</h3>
                <span className="text-xs text-brand-muted bg-brand-surface px-2.5 py-1 rounded-lg border border-border">
                  Total: {totalEmployees || 0}
                </span>
              </div>
              <div className="flex items-end justify-between gap-3 h-40">
                {(monthlyCosts || []).map((mc, i) => {
                  const maxEmp = Math.max(...(monthlyCosts || []).map(c => c.employees), 1);
                  const height = maxEmp > 0 ? Math.max(8, (mc.employees / maxEmp) * 100) : 8;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-brand-green/60 to-brand-green/20 border border-brand-green/30 min-h-[8px] relative group"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-brand-surface border border-border px-2 py-1 rounded-lg text-[10px] text-brand-text whitespace-nowrap shadow-lg z-10">
                          {mc.employees} employees
                        </div>
                      </motion.div>
                      <span className="text-[10px] text-brand-muted font-medium">{mc.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </>
      )}

      {activeTab === 'salary' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-text font-syne">Employee Salary List</h2>
            <button 
              onClick={async () => {
                setLoading(true);
                try {
                  const empRes = await userAPI.getAll();
                  setEmployees(empRes.data.data.users || []);
                } catch (e) {
                  console.error(e);
                } finally {
                  setLoading(false);
                }
              }}
              className="text-xs font-semibold text-brand-purple hover:underline cursor-pointer"
            >
              Refresh List
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div 
                key={emp._id} 
                className="glass-card rounded-2xl p-4 flex items-center justify-between hover:border-brand-purple/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-bold">
                    {emp.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-brand-text truncate">{emp.email}</p>
                    <p className="text-[10px] text-brand-muted uppercase tracking-wider">{emp.role}</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/dashboard/payroll/salary/${emp._id}`)}
                  className="p-2 rounded-lg bg-brand-surface border border-border text-brand-muted hover:text-brand-purple hover:border-brand-purple transition-all cursor-pointer"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>

          {employees.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 glass-card rounded-2xl border-dashed">
              <Users size={32} className="text-brand-muted/30 mb-3" />
              <p className="text-brand-muted text-sm font-medium">No employees found for this company.</p>
              <p className="text-[10px] text-brand-muted/60 mt-1">Try inviting new employees from the Settings page.</p>
            </div>
          )}
        </motion.div>
      )}
    </DashboardLayout>
  );
};

const WarningRow = ({ count, text, onClick }) => (
  <div 
    className={`flex items-center gap-4 p-2 rounded-xl transition-all
      ${onClick ? 'cursor-pointer hover:bg-brand-surface group' : ''}`}
    onClick={onClick}
  >
    <span className={`text-xl font-bold font-syne w-8 h-8 rounded-lg flex items-center justify-center
      ${count > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-brand-muted/10 text-brand-muted'}`}>
      {count}
    </span>
    <span className="text-sm text-brand-muted group-hover:text-brand-purple font-medium transition-colors">{text}</span>
    {onClick && <ArrowRight size={14} className="ml-auto text-brand-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />}
  </div>
);

export default Payroll;
