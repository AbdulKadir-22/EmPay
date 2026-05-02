import React from 'react';
import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

const statusConfig = {
  present: {
    color: 'bg-emerald-500',
    label: 'Present',
    shadow: 'shadow-emerald-500/40',
  },
  leave: {
    icon: Plane,
    color: 'text-blue-500',
    label: 'On Leave',
  },
  absent: {
    color: 'bg-amber-400',
    label: 'Absent',
    shadow: 'shadow-amber-400/40',
  },
};

const EmployeeCard = ({ employee, index = 0 }) => {
  // Determine status — default to 'present' if not provided
  const status = employee.attendanceStatus || 'present';
  const config = statusConfig[status] || statusConfig.present;

  const initials = employee.firstName 
    ? `${employee.firstName[0]}${employee.lastName?.[0] || ''}`.toUpperCase()
    : employee.email?.[0]?.toUpperCase() || '?';

  const fullName = employee.firstName 
    ? `${employee.firstName} ${employee.lastName || ''}`.trim()
    : employee.name || employee.email || 'Unnamed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative group glass-card rounded-2xl p-5 cursor-pointer
        hover:border-brand-purple/40 hover:shadow-xl hover:shadow-brand-purple/5 transition-all duration-300"
    >
      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        {status === 'leave' ? (
          <div className="p-1 rounded-full bg-blue-500/10" title={config.label}>
            <Plane size={14} className="text-blue-500" />
          </div>
        ) : (
          <div 
            className={`w-3 h-3 rounded-full ${config.color} ${config.shadow || ''} shadow-sm`} 
            title={config.label} 
          />
        )}
      </div>

      {/* Profile content */}
      <div className="flex flex-col items-center text-center gap-3">
        {/* Avatar */}
        <div className="relative">
          {employee.avatar ? (
            <img
              src={employee.avatar}
              alt={fullName}
              className="w-16 h-16 rounded-full object-cover border-2 border-border
                group-hover:border-brand-purple/30 transition-colors"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-purple/80 to-brand-green/80 
              flex items-center justify-center text-white text-lg font-bold
              border-2 border-border group-hover:border-brand-purple/30 transition-colors">
              {initials}
            </div>
          )}
          
          {/* Online ring for present */}
          {status === 'present' && (
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-brand-surface" />
          )}
        </div>

        {/* Info */}
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-brand-text truncate max-w-[160px]">
            {fullName}
          </h3>
          <p className="text-xs text-brand-muted truncate max-w-[160px]">
            {employee.designation || employee.department || 'Employee'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeCard;
