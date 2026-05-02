import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick, 
  fullWidth = false,
  ...props 
}) => {
  const baseStyles = `px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${fullWidth ? 'w-full' : ''}`;
  
  const variants = {
    primary: "bg-brand-purple text-white hover:bg-brand-purple/90 hover:-translate-y-1 shadow-lg shadow-brand-purple/20",
    secondary: "bg-brand-green text-white hover:bg-brand-green/90 hover:-translate-y-1 shadow-lg shadow-brand-green/20",
    outline: "border-2 border-brand-green text-brand-green hover:bg-brand-green/10 hover:-translate-y-1 shadow-sm",
    ghost: "text-brand-muted hover:text-brand-text transition-colors",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
