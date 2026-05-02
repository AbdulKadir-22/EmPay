import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import EmployeeCard from '../components/dashboard/EmployeeCard';
import { useAuth } from '../context/AuthContext';
import { useEmployees } from '../hooks/useEmployees';
import { CardSkeleton } from '../components/ui/Skeleton';

const Dashboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    data: employees = [], 
    isLoading, 
    error, 
    refetch 
  } = useEmployees();

  // Filtered employees based on search
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter(emp => {
      const name = `${emp.firstName || ''} ${emp.lastName || ''} ${emp.name || ''}`.toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const designation = (emp.designation || '').toLowerCase();
      const department = (emp.department || '').toLowerCase();
      return name.includes(q) || email.includes(q) || designation.includes(q) || department.includes(q);
    });
  }, [employees, searchQuery]);

  const isManagement = ['ADMIN', 'HR', 'PAYROLL_OFFICER'].includes(user?.role);

  return (
    <DashboardLayout onSearch={setSearchQuery}>
      {/* Page Header */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-text font-syne">
              {isManagement ? 'Employees' : 'My Dashboard'}
            </h1>
            <p className="text-sm text-brand-muted mt-1">
              {isManagement 
                ? `${filteredEmployees.length} team member${filteredEmployees.length !== 1 ? 's' : ''} in ${user?.company || 'your company'}`
                : `Welcome back, ${user?.firstName || 'there'}!`
              }
            </p>
          </div>

          {/* Stats badges */}
          {isManagement && !isLoading && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {employees.filter(e => e.status === 'ACTIVE').length} Active
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-purple/10 text-brand-purple text-xs font-semibold">
                <Users size={14} />
                {employees.length} Total
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <p className="text-brand-text font-medium mb-1">Failed to load employees</p>
          <p className="text-brand-muted text-sm mb-4">{error.response?.data?.message || error.message || 'Failed to load employees'}</p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-purple text-white text-sm font-medium
              hover:bg-brand-purple/90 transition-colors cursor-pointer"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </motion.div>
      ) : isManagement ? (
        /* Employee Grid — for Admin, HR, Payroll Officer */
        filteredEmployees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployees.map((employee, index) => (
              <EmployeeCard 
                key={employee._id || index} 
                employee={employee} 
                index={index} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center mb-4">
              <Users size={28} className="text-brand-purple" />
            </div>
            <p className="text-brand-text font-medium mb-1">
              {searchQuery ? 'No employees found' : 'No employees yet'}
            </p>
            <p className="text-brand-muted text-sm">
              {searchQuery 
                ? 'Try a different search term.' 
                : 'Invite team members to get started.'
              }
            </p>
          </div>
        )
      ) : (
        /* Employee's own dashboard */
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-8 text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-brand-purple to-brand-green 
              flex items-center justify-center text-white text-2xl font-bold mb-4">
              {user?.firstName?.[0]?.toUpperCase() || '?'}
              {user?.lastName?.[0]?.toUpperCase() || ''}
            </div>
            <h2 className="text-xl font-bold text-brand-text font-syne">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
            </h2>
            <p className="text-brand-muted text-sm mt-1">
              {user?.designation || user?.department || user?.role?.replace('_', ' ')}
            </p>
            <p className="text-brand-muted text-xs mt-1">
              {user?.company}
            </p>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
