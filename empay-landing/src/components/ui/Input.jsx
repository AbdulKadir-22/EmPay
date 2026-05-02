import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = ({ 
  label, 
  type = 'text', 
  error, 
  placeholder, 
  className = '', 
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-brand-muted px-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type={inputType}
          className={`
            w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none
            ${error 
              ? 'border-red-500 bg-red-50/50' 
              : 'border-border bg-brand-surface focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10'
            }
            placeholder:text-brand-muted/50 text-brand-text
          `}
          placeholder={placeholder}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-brand-muted hover:text-brand-purple transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-red-500 font-medium px-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
