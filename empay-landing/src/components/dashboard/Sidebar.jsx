import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  CalendarCheck, 
  CalendarOff, 
  Wallet, 
  BarChart3, 
  Settings, 
  X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Navigation items with role-based visibility
const navItems = [
  { 
    name: 'Employees', 
    path: '/dashboard', 
    icon: Users, 
    roles: ['ADMIN', 'HR', 'PAYROLL_OFFICER'] 
  },
  { 
    name: 'Attendance', 
    path: '/dashboard/attendance', 
    icon: CalendarCheck, 
    roles: ['ADMIN', 'HR', 'PAYROLL_OFFICER', 'EMPLOYEE'] 
  },
  { 
    name: 'Time Off', 
    path: '/dashboard/time-off', 
    icon: CalendarOff, 
    roles: ['ADMIN', 'HR', 'PAYROLL_OFFICER', 'EMPLOYEE'] 
  },
  { 
    name: 'Payroll', 
    path: '/dashboard/payroll', 
    icon: Wallet, 
    roles: ['ADMIN', 'PAYROLL_OFFICER'] 
  },
  { 
    name: 'Reports', 
    path: '/dashboard/reports', 
    icon: BarChart3, 
    roles: ['ADMIN', 'HR', 'PAYROLL_OFFICER'] 
  },
  { 
    name: 'Settings', 
    path: '/dashboard/settings', 
    icon: Settings, 
    roles: ['ADMIN', 'HR'] 
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 z-50 
          bg-brand-surface border-r border-border flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <Link 
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src="/Logo.png" alt="EmPay" className="h-9 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="font-syne font-bold text-lg text-brand-text leading-tight">
                Em<span className="text-brand-purple">Pay</span>
              </span>
              <span className="text-[10px] text-brand-muted truncate max-w-[140px]">
                {user?.company || 'Company'}
              </span>
            </div>
          </Link>
          <button 
            onClick={onClose} 
            className="lg:hidden p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/dashboard' 
              ? location.pathname === '/dashboard' 
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                    : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'
                  }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-green flex items-center justify-center text-white text-xs font-bold">
              {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-text truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
              </p>
              <p className="text-[10px] text-brand-muted capitalize">
                {user?.role?.replace('_', ' ')?.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
