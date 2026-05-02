import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Clock, LogIn, LogOut, 
  CalendarDays, Loader2, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { attendanceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const isManagement = ['ADMIN', 'HR', 'PAYROLL_OFFICER'].includes(user?.role);

  const [todayStatus, setTodayStatus] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Date navigation
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // day or month

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch today's clock status
  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await attendanceAPI.getTodayStatus();
        setTodayStatus(res.data.data.attendance);
      } catch { /* not clocked in */ }
    };
    fetchToday();
  }, []);

  // Fetch records based on date selection
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        let startDate, endDate;
        if (isManagement && viewMode === 'day') {
          const d = new Date(selectedDate);
          d.setHours(0, 0, 0, 0);
          startDate = d.toISOString();
          const end = new Date(d);
          end.setHours(23, 59, 59, 999);
          endDate = end.toISOString();
        } else {
          const y = selectedDate.getFullYear();
          const m = selectedDate.getMonth();
          startDate = new Date(y, m, 1).toISOString();
          endDate = new Date(y, m + 1, 0, 23, 59, 59, 999).toISOString();
        }
        const res = await attendanceAPI.getSummary({ startDate, endDate });
        setRecords(res.data.data.summary || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [selectedDate, viewMode, isManagement]);

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      const res = await attendanceAPI.clockIn();
      setTodayStatus(res.data.data.attendance);
      showToast('Clocked in successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to clock in', 'error');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try {
      const res = await attendanceAPI.clockOut();
      setTodayStatus(res.data.data.attendance);
      showToast('Clocked out successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to clock out', 'error');
    } finally {
      setClockLoading(false);
    }
  };

  // Navigation
  const navigateDate = (direction) => {
    const d = new Date(selectedDate);
    if (isManagement && viewMode === 'day') {
      d.setDate(d.getDate() + direction);
    } else {
      d.setMonth(d.getMonth() + direction);
    }
    setSelectedDate(d);
  };

  // Employee stats
  const stats = useMemo(() => {
    if (isManagement) return null;
    const present = records.filter(r => ['PRESENT', 'LATE'].includes(r.status)).length;
    const leaves = records.filter(r => r.status === 'ON_LEAVE').length;
    const total = records.length;
    return { present, leaves, total };
  }, [records, isManagement]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatWorkHours = (hours) => {
    if (!hours) return '—';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const getExtraHours = (hours) => {
    if (!hours || hours <= 8) return '—';
    return formatWorkHours(hours - 8);
  };

  const dateLabel = isManagement && viewMode === 'day'
    ? selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : selectedDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const isClockedIn = todayStatus && !todayStatus.clockOut;
  const isClockedOut = todayStatus && todayStatus.clockOut;

  return (
    <DashboardLayout>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-20 left-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium
              ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-text font-syne">Attendance</h1>

          {/* Clock In/Out Button — all roles */}
          {!isClockedOut && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={isClockedIn ? handleClockOut : handleClockIn}
              disabled={clockLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition-colors cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isClockedIn 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                  : 'bg-brand-green hover:bg-brand-green/90 shadow-brand-green/20'
                }`}
            >
              {clockLoading ? <Loader2 size={18} className="animate-spin" /> : isClockedIn ? <LogOut size={18} /> : <LogIn size={18} />}
              {clockLoading ? 'Processing...' : isClockedIn ? 'Clock Out' : 'Clock In'}
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Controls Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Date Navigation */}
        <div className="flex items-center gap-1">
          <button onClick={() => navigateDate(-1)} className="p-2 rounded-lg bg-brand-surface border border-border text-brand-muted hover:text-brand-text transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => navigateDate(1)} className="p-2 rounded-lg bg-brand-surface border border-border text-brand-muted hover:text-brand-text transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Date Label */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-surface border border-border">
          <CalendarDays size={16} className="text-brand-purple" />
          <span className="text-sm font-medium text-brand-text">{dateLabel}</span>
        </div>

        {/* View Toggle (Management only) */}
        {isManagement && (
          <div className="flex bg-brand-surface rounded-lg p-0.5 border border-border">
            {['day', 'month'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all capitalize cursor-pointer
                  ${viewMode === mode ? 'bg-brand-purple text-white shadow-sm' : 'text-brand-muted hover:text-brand-text'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}

        {/* Employee Stats */}
        {!isManagement && stats && (
          <div className="flex items-center gap-3 ml-auto">
            <StatBadge label="Days Present" value={stats.present} color="emerald" />
            <StatBadge label="Leaves" value={stats.leaves} color="amber" />
            <StatBadge label="Total Working" value={stats.total} color="purple" />
          </div>
        )}
      </motion.div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" />
          <p className="text-brand-muted text-sm mt-4">Loading attendance...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle size={28} className="text-red-500 mb-3" />
          <p className="text-brand-text font-medium">{error}</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    {isManagement ? 'Employee' : 'Date'}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Check In</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Check Out</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Work Hours</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Extra Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((rec, i) => (
                  <motion.tr
                    key={rec._id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-brand-bg/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-brand-text">
                      {isManagement 
                        ? rec.employeeName || rec.employeeEmail || '—'
                        : new Date(rec.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-muted font-mono">{formatTime(rec.clockIn)}</td>
                    <td className="px-6 py-4 text-sm text-brand-muted font-mono">{formatTime(rec.clockOut)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-brand-text font-mono">{formatWorkHours(rec.workHours)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-mono ${rec.workHours > 8 ? 'text-brand-green font-semibold' : 'text-brand-muted'}`}>
                        {getExtraHours(rec.workHours)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-brand-muted">
                      No attendance records for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
};

const StatBadge = ({ label, value, color }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${color}-500/10 text-${color}-500 text-xs font-semibold`}>
    <span className={`w-2 h-2 rounded-full bg-${color}-500`} />
    {value} {label}
  </div>
);

export default Attendance;
