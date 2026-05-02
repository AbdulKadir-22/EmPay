import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, LogIn, LogOut, 
  CalendarDays, Loader2, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { 
  useTodayAttendance, 
  useAttendanceSummary, 
  useClockIn, 
  useClockOut 
} from '../hooks/useAttendance';
import { TableSkeleton } from '../components/ui/Skeleton';
import DataTable from '../components/ui/DataTable';

const Attendance = () => {
  const { user } = useAuth();
  const isManagement = ['ADMIN', 'HR', 'PAYROLL_OFFICER'].includes(user?.role);

  const [toast, setToast] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // day or month

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // React Query Hooks
  const { data: todayStatus } = useTodayAttendance();
  
  const queryParams = useMemo(() => {
    let startDate, endDate;
    if (isManagement && viewMode === 'day') {
      const d = new Date(selectedDate);
      startDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)).toISOString();
      endDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)).toISOString();
    } else {
      const y = selectedDate.getFullYear();
      const m = selectedDate.getMonth();
      startDate = new Date(Date.UTC(y, m, 1, 0, 0, 0)).toISOString();
      endDate = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999)).toISOString();
    }
    return { startDate, endDate };
  }, [selectedDate, viewMode, isManagement]);

  const { data: records = [], isLoading: loading, error } = useAttendanceSummary(queryParams);
  
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();
  const clockLoading = clockInMutation.isPending || clockOutMutation.isPending;

  const handleClockIn = async () => {
    try {
      await clockInMutation.mutateAsync();
      showToast('Clocked in successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to clock in', 'error');
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync();
      showToast('Clocked out successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to clock out', 'error');
    }
  };

  const navigateDate = (direction) => {
    const d = new Date(selectedDate);
    if (isManagement && viewMode === 'day') {
      d.setDate(d.getDate() + direction);
    } else {
      d.setMonth(d.getMonth() + direction);
    }
    setSelectedDate(d);
  };

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

  const columns = useMemo(() => [
    { 
      key: isManagement ? 'employeeName' : 'date', 
      header: isManagement ? 'Employee' : 'Date',
      sortable: true,
      render: (val, row) => (
        <span className="font-medium text-brand-text">
          {isManagement 
            ? val || row.employeeEmail || '—'
            : new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
          }
        </span>
      )
    },
    { 
      key: 'clockIn', 
      header: 'Check In', 
      sortable: true,
      render: (val) => <span className="font-mono text-brand-muted">{formatTime(val)}</span>
    },
    { 
      key: 'clockOut', 
      header: 'Check Out', 
      sortable: true,
      render: (val) => <span className="font-mono text-brand-muted">{formatTime(val)}</span>
    },
    { 
      key: 'workHours', 
      header: 'Work Hours', 
      sortable: true,
      render: (val) => <span className="font-semibold text-brand-text font-mono">{formatWorkHours(val)}</span>
    },
    { 
      key: 'extraHours', 
      header: 'Extra Hours', 
      sortable: false,
      render: (_, row) => (
        <span className={`font-mono ${row.workHours > 8 ? 'text-brand-green font-semibold' : 'text-brand-muted'}`}>
          {getExtraHours(row.workHours)}
        </span>
      )
    }
  ], [isManagement]);

  return (
    <DashboardLayout>
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

      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-text font-syne">Attendance</h1>

          {!isClockedOut && (
            <button
              onClick={isClockedIn ? handleClockOut : handleClockIn}
              disabled={clockLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition-all cursor-pointer
                disabled:opacity-50 active:scale-95
                ${isClockedIn 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                  : 'bg-brand-green hover:bg-brand-green/90 shadow-brand-green/20'
                }`}
            >
              {clockLoading ? <Loader2 size={18} className="animate-spin" /> : isClockedIn ? <LogOut size={18} /> : <LogIn size={18} />}
              {clockLoading ? 'Processing...' : isClockedIn ? 'Clock Out' : 'Clock In'}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-1">
          <button onClick={() => navigateDate(-1)} className="p-2 rounded-lg bg-brand-surface border border-border text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => navigateDate(1)} className="p-2 rounded-lg bg-brand-surface border border-border text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-surface border border-border">
          <CalendarDays size={16} className="text-brand-purple" />
          <span className="text-sm font-medium text-brand-text">{dateLabel}</span>
        </div>

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

        {!isManagement && stats && (
          <div className="flex items-center gap-3 ml-auto">
            <StatBadge label="Days Present" value={stats.present} color="emerald" />
            <StatBadge label="Leaves" value={stats.leaves} color="amber" />
            <StatBadge label="Total Working" value={stats.total} color="purple" />
          </div>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={10} cols={5} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle size={28} className="text-red-500 mb-3" />
          <p className="text-brand-text font-medium">{error}</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={records} 
          searchPlaceholder="Search attendance records..." 
        />
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
