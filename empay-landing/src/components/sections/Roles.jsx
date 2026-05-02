import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, FileText, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';

const Roles = () => {
  const [activeRole, setActiveRole] = useState('admin');

  const roles = [
    { id: 'admin', name: 'Admin', icon: Shield },
    { id: 'employee', name: 'Employee', icon: User },
    { id: 'hr', name: 'HR Officer', icon: FileText },
    { id: 'payroll', name: 'Payroll Officer', icon: Briefcase },
  ];

  const roleData = {
    admin: {
      title: 'Administrator',
      sub: 'Full system control — the only role that can configure the entire platform.',
      perms: [
        { text: 'Create & manage all user accounts', allowed: true },
        { text: 'Assign & modify user roles', allowed: true },
        { text: 'View all dashboards & global reports', allowed: true },
        { text: 'Configure department structures', allowed: true },
        { text: 'Manage salary structures & pay grades', allowed: true },
        { text: 'Override payroll & leave decisions', allowed: true },
        { text: 'Access complete audit logs', allowed: true },
        { text: 'Generate organization-wide analytics', allowed: true },
      ]
    },
    employee: {
      title: 'Employee',
      sub: 'Self-service access to personal data, attendance marking, and leave requests.',
      perms: [
        { text: 'Mark daily attendance', allowed: true },
        { text: 'Apply for leave requests', allowed: true },
        { text: 'View personal attendance history', allowed: true },
        { text: 'Download own payslips', allowed: true },
        { text: 'View own leave balance', allowed: true },
        { text: 'Update personal profile details', allowed: true },
        { text: 'Cannot view other employee data', allowed: false },
        { text: 'Cannot access payroll configurations', allowed: false },
      ]
    },
    hr: {
      title: 'HR Officer',
      sub: 'Monitors workforce data, reviews attendance, and manages leave approvals.',
      perms: [
        { text: 'View all employee attendance records', allowed: true },
        { text: 'Review & approve leave requests', allowed: true },
        { text: 'Reject leave with documented reason', allowed: true },
        { text: 'Generate HR-level reports', allowed: true },
        { text: 'Manage employee onboarding data', allowed: true },
        { text: 'View department-level analytics', allowed: true },
        { text: 'Cannot process payroll or payrun', allowed: false },
        { text: 'Cannot configure salary structures', allowed: false },
      ]
    },
    payroll: {
      title: 'Payroll Officer',
      sub: 'Owns the payrun lifecycle — from salary calculation to distribution.',
      perms: [
        { text: 'Initiate & process monthly payruns', allowed: true },
        { text: 'View attendance data for payroll calc', allowed: true },
        { text: 'Calculate PF, PT & net deductions', allowed: true },
        { text: 'Generate & distribute payslips', allowed: true },
        { text: 'View payroll history & run logs', allowed: true },
        { text: 'Export payroll data to reports', allowed: true },
        { text: 'Cannot approve or reject leave', allowed: false },
        { text: 'Cannot manage employee accounts', allowed: false },
      ]
    }
  };

  return (
    <section id="roles" className="py-24 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <div className="text-brand-purple font-mono text-sm tracking-[0.2em] uppercase mb-4">Access Control</div>
          <h2 className="font-syne font-extrabold text-4xl md:text-6xl text-brand-text mb-6 tracking-tight">
            Four Roles. One System. <span className="italic text-brand-green">Zero Overlap.</span>
          </h2>
          <p className="text-brand-muted text-lg leading-relaxed max-w-2xl">
            Precision-scoped permissions for every person in your organization — built with the principle of least privilege.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-12">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-300 border ${
                activeRole === role.id 
                ? 'bg-brand-purple text-white border-brand-purple shadow-xl shadow-brand-purple/20 scale-105' 
                : 'bg-brand-surface text-brand-muted border-border hover:bg-white/10 hover:text-brand-text'
              }`}
            >
              <role.icon size={20} />
              {role.name}
            </button>
          ))}
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-brand-surface border-l-4 border-brand-purple border-y border-r border-border rounded-2xl p-8 md:p-12 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-brand-purple/5"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                {React.createElement(roles.find(r => r.id === activeRole).icon, { size: 200 })}
              </div>

              <div className="relative z-10">
                <h3 className="font-syne font-bold text-3xl text-brand-text mb-2">
                  {roleData[activeRole].title}
                </h3>
                <p className="text-brand-muted mb-10 text-lg">
                  {roleData[activeRole].sub}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roleData[activeRole].perms.map((perm, i) => (
                    <div 
                      key={i} 
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                        perm.allowed 
                        ? 'bg-brand-green/5 border-brand-green/10 text-brand-text' 
                        : 'bg-red-500/5 border-red-500/10 text-brand-muted opacity-60'
                      }`}
                    >
                      {perm.allowed ? (
                        <CheckCircle2 className="text-brand-green shrink-0 mt-0.5" size={18} />
                      ) : (
                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                      )}
                      <span className="text-sm font-medium">{perm.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Roles;
