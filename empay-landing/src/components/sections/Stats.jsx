import React from 'react';
import { motion } from 'framer-motion';

const Stats = () => {
  const stats = [
    { num: '4', label: 'Roles Supported' },
    { num: '7', label: 'Core Modules' },
    { num: '∞', label: 'Payrun Cycles' },
    { num: '1', label: 'Unified Dashboard' },
  ];

  return (
    <section id="stats" className="py-12 bg-brand-surface border-y border-border relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/5 via-transparent to-brand-green/5" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="w-8 h-1 bg-brand-green mx-auto mb-6 group-hover:w-12 transition-all duration-300" />
              <div className="font-mono text-5xl md:text-6xl font-extrabold text-brand-text mb-2 tracking-tighter">
                {stat.num}
              </div>
              <div className="text-brand-muted text-sm font-medium uppercase tracking-widest">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
