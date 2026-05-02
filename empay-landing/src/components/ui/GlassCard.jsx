import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={hoverEffect ? { y: -10, transition: { duration: 0.3 } } : {}}
      className={`relative overflow-hidden glass-card rounded-2xl p-8 transition-all duration-300 ${hoverEffect ? 'hover:border-brand-purple/50 hover:shadow-2xl hover:shadow-brand-purple/10' : ''} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
