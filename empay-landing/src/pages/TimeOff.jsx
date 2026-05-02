import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Check, XCircle, Upload, Loader2, AlertCircle, CheckCircle,
  CalendarDays, Clock
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { leaveAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TimeOff = () => {
  const { user } = useAuth();
  const isManagement = ['ADMIN', 'HR'].includes(user?.role);

  const [activeTab, setActiveTab] = useState('timeOff'); // timeOff | allocation
  const [allocations, setAllocations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [typesRes, allocRes, historyRes] = await Promise.all([
          leaveAPI.getTypes(),
          leaveAPI.getMyAllocations(new Date().getFullYear()),
          leaveAPI.getMyHistory(),
        ]);
        setLeaveTypes(typesRes.data.data.types || []);
        setAllocations(allocRes.data.data.allocations || []);
        setRequests(historyRes.data.data.history || []);

        if (isManagement) {
          const pendingRes = await leaveAPI.getPending();
          setPendingRequests(pendingRes.data.data.requests || []);
        }
      } catch (err) {
        console.error('Failed to load time off data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isManagement]);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setSubmitting(true);
    console.log('Submitting leave request:', formData);
    try {
      const payload = {
        leaveTypeId: formData.leaveTypeId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        reason: formData.reason,
      };
      console.log('Request payload:', payload);
      const response = await leaveAPI.request(payload);
      console.log('Request success:', response.data);
      showToast('Leave request submitted!');
      setShowModal(false);
      setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      // Refresh
      const historyRes = await leaveAPI.getMyHistory();
      setRequests(historyRes.data.data.history || []);
      const allocRes = await leaveAPI.getMyAllocations(new Date().getFullYear());
      setAllocations(allocRes.data.data.allocations || []);
    } catch (err) {
      console.error('Submission error:', err);
      showToast(err.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await leaveAPI.updateStatus(requestId, status);
      showToast(`Leave ${status.toLowerCase()} successfully`);
      const pendingRes = await leaveAPI.getPending();
      setPendingRequests(pendingRes.data.data.requests || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const calcDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const diff = new Date(formData.endDate) - new Date(formData.startDate);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: 'bg-amber-500/10 text-amber-500',
      APPROVED: 'bg-emerald-500/10 text-emerald-500',
      REJECTED: 'bg-red-500/10 text-red-500',
      CANCELLED: 'bg-gray-500/10 text-gray-500',
    };
    return (
      <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-lg ${config[status] || config.PENDING}`}>
        {status}
      </span>
    );
  };

  // Display data: management sees pending, employee sees own history
  const displayRequests = isManagement && activeTab === 'timeOff' ? pendingRequests : requests;

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

      {/* Header */}
      <div className="mb-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-text font-syne">Time Off</h1>
            {isManagement && (
              <div className="flex bg-brand-surface rounded-lg p-0.5 border border-border">
                {['timeOff', 'allocation'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer
                      ${activeTab === tab ? 'bg-brand-purple text-white shadow-sm' : 'text-brand-muted hover:text-brand-text'}`}
                  >
                    {tab === 'timeOff' ? 'Time Off' : 'Allocation'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-xl
              hover:bg-brand-green/90 shadow-lg shadow-brand-green/20 transition-colors cursor-pointer"
          >
            <Plus size={18} /> NEW
          </motion.button>
        </motion.div>
      </div>

      {/* Allocation Badges */}
      <div className="flex flex-wrap gap-4 mb-6">
        {allocations.map((alloc) => (
          <motion.div
            key={alloc._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-5 min-w-[200px] flex-1 max-w-xs"
          >
            <p className="text-sm font-bold text-brand-purple font-syne">
              {alloc.leaveType?.name || 'Leave'}
            </p>
            <p className="text-3xl font-bold text-brand-text font-syne mt-2">
              {alloc.remainingDays}
              <span className="text-sm font-normal text-brand-muted ml-1">Days Available</span>
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-brand-muted">
              <span>Total: {alloc.totalDays}</span>
              <span>Used: {alloc.usedDays}</span>
            </div>
          </motion.div>
        ))}
        {allocations.length === 0 && !loading && (
          <div className="glass-card rounded-2xl p-5 w-full text-center text-brand-muted text-sm">
            No leave allocations found. {isManagement ? 'Create leave types and allocate them first.' : 'Contact your HR to allocate leave.'}
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" />
          <p className="text-brand-muted text-sm mt-4">Loading time off data...</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Start Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">End Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Time Off Type</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Status</th>
                  {isManagement && activeTab === 'timeOff' && (
                    <th className="text-right px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayRequests.map((req, i) => (
                  <motion.tr
                    key={req._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-brand-bg/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-brand-text">
                        {req.employeeName || req.employee?.firstName
                          ? `${req.employee?.firstName || ''} ${req.employee?.lastName || ''}`.trim()
                          : req.employee?.email || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-muted">
                      {new Date(req.startDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-muted">
                      {new Date(req.endDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-brand-purple">
                        {req.leaveType?.name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    {isManagement && activeTab === 'timeOff' && (
                      <td className="px-6 py-4 text-right">
                        {req.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateStatus(req._id, 'REJECTED')}
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(req._id, 'APPROVED')}
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </motion.tr>
                ))}
                {displayRequests.length === 0 && (
                  <tr>
                    <td colSpan={isManagement ? 6 : 5} className="px-6 py-16 text-center text-brand-muted">
                      {isManagement ? 'No pending leave requests.' : 'No leave requests yet. Click NEW to submit one.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Leave Request Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card rounded-2xl p-6 md:p-8 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-brand-text font-syne">Time Off Request</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                {/* Employee - Auto filled */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brand-muted">Employee</label>
                  <div className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
                  </div>
                </div>

                {/* Leave Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brand-muted">Time Off Type</label>
                  <select
                    value={formData.leaveTypeId}
                    onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                    required
                    className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text
                      focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Select type...</option>
                    {leaveTypes.map(lt => (
                      <option key={lt._id} value={lt._id}>{lt.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-brand-muted">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text
                        focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-brand-muted">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                      min={formData.startDate || undefined}
                      className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text
                        focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all"
                    />
                  </div>
                </div>

                {/* Allocation Days */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-purple/5 border border-brand-purple/10">
                  <CalendarDays size={18} className="text-brand-purple" />
                  <span className="text-sm text-brand-text font-semibold">{calcDays().toFixed(2)} Days</span>
                </div>

                {/* Reason */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brand-muted">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    rows={2}
                    placeholder="Describe reason for leave..."
                    className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text resize-none
                      focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-brand-muted
                      hover:text-brand-text hover:bg-brand-surface transition-colors cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-green text-white text-sm font-semibold
                      hover:bg-brand-green/90 shadow-lg shadow-brand-green/20 transition-colors cursor-pointer
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Submit
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
