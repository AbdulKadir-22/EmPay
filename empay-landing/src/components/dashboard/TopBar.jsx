import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, UserCircle, LogOut, Plus, Sun, Moon, CheckCircle2, Clock, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationAPI } from '../../services/api';

const TopBar = ({ onMenuToggle, onSearch }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getMy();
      const list = res.data.data.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const canAddEmployee = ['ADMIN', 'HR'].includes(user?.role);

  const initials = user?.firstName 
    ? `${user.firstName[0]}${user.lastName?.[0] || ''}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-30 bg-brand-bg/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-4 px-4 lg:px-6 h-16">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* NEW button (Admin/HR only) */}
        {canAddEmployee && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/settings')}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-brand-green text-white text-sm font-semibold rounded-xl 
              hover:bg-brand-green/90 shadow-lg shadow-brand-green/20 transition-colors cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} />
            NEW
          </motion.button>
        )}

        {/* Search */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-border 
                text-sm text-brand-text placeholder:text-brand-muted/50
                focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10
                transition-all duration-200"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-brand-muted hover:text-brand-purple hover:bg-brand-surface transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notification bell */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-lg transition-colors cursor-pointer
                ${showNotifications ? 'bg-brand-surface text-brand-purple' : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface'}`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-brand-bg" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-brand-surface border border-border rounded-xl shadow-2xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-bold text-brand-text">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-semibold bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded-full">{unreadCount} New</span>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((n) => {
                      const Icon = n.type === 'SUCCESS' ? CheckCircle2 : n.type === 'WARNING' ? AlertCircle : Info;
                      const color = n.type === 'SUCCESS' ? 'text-emerald-500' : n.type === 'WARNING' ? 'text-amber-500' : 'text-blue-500';
                      return (
                        <div key={n._id} className={`px-4 py-3 border-b border-border/50 hover:bg-brand-bg/50 transition-colors cursor-pointer ${!n.read ? 'bg-brand-purple/5' : ''}`}>
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-lg bg-brand-bg ${color}`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-brand-text leading-none">{n.title}</p>
                              <p className="text-xs text-brand-muted mt-1 leading-tight">{n.message}</p>
                              <p className="text-[10px] text-brand-muted/60 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button 
                    onClick={handleMarkAllRead}
                    className="w-full py-2.5 text-xs font-semibold text-brand-purple hover:bg-brand-purple/5 transition-colors"
                  >
                    Mark All as Read
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-brand-surface transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-purple to-brand-green flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {initials}
              </div>
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-brand-surface border border-border rounded-xl shadow-2xl overflow-hidden"
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-brand-text truncate">
                      {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
                    </p>
                    <p className="text-xs text-brand-muted truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-brand-purple/10 text-brand-purple rounded-full capitalize">
                      {user?.role?.replace('_', ' ')?.toLowerCase()}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setShowDropdown(false); navigate('/dashboard/profile'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-brand-text hover:bg-brand-bg transition-colors"
                    >
                      <UserCircle size={18} className="text-brand-muted" />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/5 transition-colors"
                    >
                      <LogOut size={18} />
                      Log Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
