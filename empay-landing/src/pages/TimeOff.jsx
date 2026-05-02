import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Check, XCircle, Loader2, AlertCircle, CheckCircle,
  CalendarDays
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { 
  useLeaveTypes, 
  useMyLeaveAllocations, 
  useMyLeaveHistory, 
  usePendingLeaveRequests,
  useRequestLeave,
  useUpdateLeaveStatus
} from '../hooks/useLeaves';
import { TableSkeleton, StatsSkeleton } from '../components/ui/Skeleton';
import DataTable from '../components/ui/DataTable';

const TimeOff = () => {
  const { user } = useAuth();
  const isManagement = ['ADMIN', 'HR', 'PAYROLL_OFFICER'].includes(user?.role);

  const [activeTab, setActiveTab] = useState('timeOff'); // timeOff | allocation
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // React Query Hooks
  const { data: leaveTypes = [], isLoading: loadingTypes } = useLeaveTypes();
  const { data: allocations = [], isLoading: loadingAlloc } = useMyLeaveAllocations(new Date().getFullYear());
  const { data: requests = [], isLoading: loadingHistory } = useMyLeaveHistory();
  const { data: pendingRequests = [], isLoading: loadingPending } = usePendingLeaveRequests(isManagement);

  const requestMutation = useRequestLeave();
  const statusMutation = useUpdateLeaveStatus();

  const loading = loadingTypes || loadingAlloc || loadingHistory || (isManagement && loadingPending);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const payload = {
        leaveTypeId: formData.leaveTypeId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        reason: formData.reason,
      };
      
      await requestMutation.mutateAsync(payload);
      showToast('Leave request submitted!');
      setShowModal(false);
      setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit request', 'error');
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await statusMutation.mutateAsync({ requestId, status });
      showToast(`Leave ${status.toLowerCase()} successfully`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const calcDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diff = end - start;
    return Math.max(0, diff / (1000 * 60 * 60 * 24) + 1);
  };

  const columns = useMemo(() => [
    { 
      key: 'employeeName', 
      header: 'Name', 
      sortable: true,
      render: (val, row) => (
        <span className="font-medium text-brand-text">
          {val || (row.employee?.firstName 
            ? `${row.employee.firstName} ${row.employee.lastName || ''}`.trim()
            : row.employee?.email || '—')}
        </span>
      )
    },
    { 
      key: 'startDate', 
      header: 'Start Date', 
      sortable: true,
      render: (val) => <span className="text-brand-muted">{new Date(val).toLocaleDateString('en-IN')}</span>
    },
    { 
      key: 'endDate', 
      header: 'End Date', 
      sortable: true,
      render: (val) => <span className="text-brand-muted">{new Date(val).toLocaleDateString('en-IN')}</span>
    },
    { 
      key: 'leaveType', 
      header: 'Type', 
      sortable: true,
      render: (val) => <span className="font-medium text-brand-purple">{val?.name || 'Leave'}</span>
    },
    { 
      key: 'status', 
      header: 'Status', 
      sortable: true,
      render: (val) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold
          ${val === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 
            val === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 
            'bg-amber-500/10 text-amber-500'}`}
        >
          {val}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        isManagement && activeTab === 'timeOff' && row.status === 'PENDING' ? (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleUpdateStatus(row._id, 'APPROVED')}
              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
              title="Approve"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => handleUpdateStatus(row._id, 'REJECTED')}
              className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
              title="Reject"
            >
              <XCircle size={16} />
            </button>
          </div>
        ) : null
      )
    }
  ], [isManagement, activeTab]);

  const displayRequests = activeTab === 'timeOff' ? (isManagement ? pendingRequests : requests) : [];

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
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-text font-syne">Time Off</h1>
            <p className="text-brand-muted text-sm mt-1">Manage leave requests and allocations</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-purple text-white text-sm font-semibold shadow-lg shadow-brand-purple/20 hover:bg-brand-purple/90 transition-all cursor-pointer active:scale-95"
          >
            <Plus size={18} />
            New Request
          </button>
        </div>
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="flex flex-wrap gap-4 mb-6">
          {allocations.map((alloc) => (
            <motion.div
              key={alloc._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-5 min-w-[200px] flex-1 max-w-xs border border-border"
            >
              <p className="text-sm font-bold text-brand-purple font-syne">
                {alloc.leaveType?.name || 'Leave'}
              </p>
              <p className="text-3xl font-bold text-brand-text font-syne mt-2">
                {alloc.remainingDays}
                <span className="text-sm font-normal text-brand-muted ml-1">Days</span>
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-brand-muted">
                <span>Total: {alloc.totalDays}</span>
                <span>Used: {alloc.usedDays}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={8} cols={isManagement ? 6 : 5} />
      ) : (
        <DataTable 
          columns={isManagement && activeTab === 'timeOff' ? columns : columns.filter(c => c.key !== 'actions')} 
          data={displayRequests} 
          searchPlaceholder="Search leave records..." 
        />
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-brand-bg rounded-3xl p-6 w-full max-w-md shadow-2xl border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-brand-text font-syne">Request Time Off</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-brand-surface transition-colors cursor-pointer">
                  <X size={20} className="text-brand-muted" />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brand-muted ml-1">Time Off Type</label>
                  <select
                    value={formData.leaveTypeId}
                    onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                    required
                    className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select type...</option>
                    {leaveTypes.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.totalDays} days)</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-brand-muted ml-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text focus:outline-none focus:border-brand-purple transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-brand-muted ml-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                      className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text focus:outline-none focus:border-brand-purple transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-purple/5 border border-brand-purple/10">
                  <CalendarDays size={18} className="text-brand-purple" />
                  <span className="text-sm text-brand-text font-semibold">{calcDays()} Days requested</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brand-muted ml-1">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    rows={3}
                    placeholder="Provide a reason for your request..."
                    className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text resize-none focus:outline-none focus:border-brand-purple transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-green text-white text-sm font-semibold hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20 disabled:opacity-50 cursor-pointer"
                  >
                    {requestMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default TimeOff;
