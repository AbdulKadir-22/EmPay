import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`relative overflow-hidden bg-brand-surface/50 rounded-lg ${className}`}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-purple/5 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="glass-card rounded-2xl p-6 h-48 flex flex-col justify-between">
    <div className="flex items-start justify-between">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <Skeleton className="w-16 h-6 rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton className="w-3/4 h-6" />
      <Skeleton className="w-1/2 h-4" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="glass-card rounded-2xl overflow-hidden">
    <div className="border-b border-border p-4">
      <div className="flex gap-4">
        {[...Array(cols)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
    </div>
    <div className="p-4 space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          {[...Array(cols)].map((_, j) => (
            <Skeleton key={j} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="flex flex-wrap gap-4 mb-6">
    {[...Array(3)].map((_, i) => (
      <Skeleton key={i} className="h-24 min-w-[200px] flex-1 max-w-xs rounded-2xl" />
    ))}
  </div>
);

export default Skeleton;
