import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, X, Save, Pencil, ChevronDown, 
  AlertCircle, CheckCircle, Loader2, Copy, Key
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'HR', label: 'HR' },
  { value: 'PAYROLL_OFFICER', label: 'Payroll Officer' },
  { value: 'EMPLOYEE', label: 'Employee' },
];

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [tempPasswordInfo, setTempPasswordInfo] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'EMPLOYEE',
    department: '',
    designation: '',
    employeeId: '',
  });

  const canManage = ['ADMIN', 'HR'].includes(user?.role);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAll();
      setUsers(response.data.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', email: '', role: 'EMPLOYEE',
      department: '', designation: '', employeeId: '',
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (u) => {
    setEditingUser(u);
    setFormData({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      role: u.role || 'EMPLOYEE',
      department: u.department || '',
      designation: u.designation || '',
      employeeId: u.employeeId || '',
    });
    setShowForm(true);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        await userAPI.update(editingUser._id, formData);
        showToast('User updated successfully');
      } else {
        const response = await userAPI.invite({
          ...formData,
          joiningDate: new Date().toISOString(),
        });
        const tempPwd = response.data?.data?.tempPassword;
        if (tempPwd) {
          setTempPasswordInfo({ email: formData.email, name: `${formData.firstName} ${formData.lastName}`, password: tempPwd });
        }
        showToast('User invited successfully');
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRowClick = (u) => {
    navigate(`/dashboard/profile/${u._id}`);
  };

  return (
    <DashboardLayout>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-20 left-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium
              ${toast.type === 'error' 
                ? 'bg-red-500 text-white' 
                : 'bg-emerald-500 text-white'
              }`}
          >
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Temp Password Banner */}
      <AnimatePresence>
        {tempPasswordInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-5 border-2 border-amber-500/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Key size={20} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-brand-text">Temporary Password for {tempPasswordInfo.name}</h3>
                  <p className="text-xs text-brand-muted mt-0.5">Share this with the user. They will be asked to set a new password on first login.</p>
                  <div className="mt-3 flex items-center gap-3">
                    <code className="px-4 py-2 rounded-lg bg-brand-bg border border-border text-brand-text font-mono text-sm tracking-wider">
                      {tempPasswordInfo.password}
                    </code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(tempPasswordInfo.password); showToast('Password copied!'); }}
                      className="p-2 rounded-lg text-brand-muted hover:text-brand-purple hover:bg-brand-purple/10 transition-colors"
                      title="Copy password"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-brand-muted mt-2">Email: <span className="font-mono text-brand-text">{tempPasswordInfo.email}</span></p>
                </div>
                <button onClick={() => setTempPasswordInfo(null)} className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-text font-syne">
              User Settings
            </h1>
            <p className="text-sm text-brand-muted mt-1">
              Manage team members in {user?.company || 'your company'}
            </p>
          </div>
          {canManage && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAddNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white text-sm font-semibold rounded-xl
                hover:bg-brand-green/90 shadow-lg shadow-brand-green/20 transition-colors cursor-pointer"
            >
              <UserPlus size={18} />
              Add User
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Form Panel */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-brand-text font-syne">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                <button onClick={resetForm} className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brand-muted">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text
                      focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all"
                    placeholder="John"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brand-muted">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text
                      focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all"
                    placeholder="Doe"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brand-muted">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!editingUser}
                    className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text
                      focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brand-muted">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    required={!editingUser}
                    className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text
                      focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all"
                    placeholder="EMP-001"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brand-muted">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required={!editingUser}
                    className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text
                      focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all"
                    placeholder="Engineering"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brand-muted">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    required={!editingUser}
                    className="px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text
                      focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all"
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-brand-muted">Role</label>
                  <div className="relative">
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full appearance-none px-4 py-2.5 rounded-xl border border-border bg-brand-surface text-sm text-brand-text
                        focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 transition-all cursor-pointer"
                    >
                      {ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                  </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-brand-muted
                      hover:text-brand-text hover:bg-brand-surface transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-purple text-white text-sm font-semibold
                      hover:bg-brand-purple/90 shadow-lg shadow-brand-purple/20 transition-colors cursor-pointer
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingUser ? 'Update' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" />
          <p className="text-brand-muted text-sm mt-4">Loading users...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle size={28} className="text-red-500 mb-3" />
          <p className="text-brand-text font-medium">{error}</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">User Name</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Login ID</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Status</th>
                  {canManage && (
                    <th className="text-right px-6 py-4 text-xs font-semibold text-brand-muted uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u, i) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleRowClick(u)}
                    className="hover:bg-brand-bg/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple/80 to-brand-green/80 
                          flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.firstName?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium text-brand-text group-hover:text-brand-purple transition-colors">
                          {u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unnamed'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-muted font-mono">
                      {u.employeeId || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-muted">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize
                        ${u.role === 'ADMIN' ? 'bg-brand-purple/10 text-brand-purple' : 
                          u.role === 'HR' ? 'bg-blue-500/10 text-blue-500' : 
                          u.role === 'PAYROLL_OFFICER' ? 'bg-amber-500/10 text-amber-500' : 
                          'bg-emerald-500/10 text-emerald-500'}`
                      }>
                        {u.role?.replace('_', ' ')?.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium
                        ${u.status === 'ACTIVE' ? 'text-emerald-500' : 
                          u.status === 'PENDING' ? 'text-amber-500' : 'text-red-500'}`
                      }>
                        <span className={`w-1.5 h-1.5 rounded-full 
                          ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 
                            u.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'}`} 
                        />
                        {u.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(u);
                          }}
                          className="p-2 rounded-lg text-brand-muted hover:text-brand-purple hover:bg-brand-purple/10 transition-colors"
                          title="Edit user"
                        >
                          <Pencil size={15} />
                        </button>
                      </td>
                    )}
                  </motion.tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={canManage ? 6 : 5} className="px-6 py-16 text-center text-brand-muted">
                      No users found. Click "Add User" to invite team members.
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

export default Settings;
