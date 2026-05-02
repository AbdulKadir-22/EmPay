import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CalendarDays, Banknote, BarChart3 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const Features = () => {
  const features = [
    {
      num: '01',
      icon: ShieldCheck,
      title: 'User & Role Management',
      desc: 'Four distinct roles, zero confusion. Admin, Employee, HR Officer, Payroll Officer — each with precisely scoped permissions and access levels that don\'t overlap.',
      color: 'brand-green'
    },
    {
      num: '02',
      icon: CalendarDays,
      title: 'Attendance & Leave Management',
      desc: 'Employees mark attendance, apply for leaves. HR monitors. Payroll Officer approves. Seamless multi-step workflows, zero paperwork, full audit trail.',
      color: 'brand-purple'
    },
    {
      num: '03',
      icon: Banknote,
      title: 'Payroll Management',
      desc: 'Salary breakdowns, PF deductions, Professional Tax, net pay — all auto-calculated from attendance records. Payslips generated and distributed in one click.',
      color: 'brand-green'
    },
    {
      num: '04',
      icon: BarChart3,
      title: 'Dashboard & Analytics',
      desc: 'Real-time charts for attendance trends, leave patterns, and payroll metrics. Admins see the full picture. Employees see exactly what matters to them.',
      color: 'brand-purple'
    }
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 max-w-2xl">
          <div className="text-brand-green font-mono text-sm tracking-[0.2em] uppercase mb-4">Modules</div>
          <h2 className="font-syne font-extrabold text-4xl md:text-6xl text-brand-text mb-6 leading-tight">
            Everything Your HR Team Needs
          </h2>
          <p className="text-brand-muted text-lg leading-relaxed">
            One system. Every workflow. Designed so each role has exactly what they need — nothing more, nothing less.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <GlassCard key={i} className="group">
              <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-brand-bg dark:bg-white/5 border border-border flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  <feature.icon className={`text-${feature.color} w-8 h-8`} />
                </div>
                <span className="font-mono text-brand-text/5 dark:text-white/10 text-5xl font-bold group-hover:text-brand-purple/10 dark:group-hover:text-white/20 transition-colors">
                  {feature.num}
                </span>
              </div>
              <h3 className="font-syne font-bold text-2xl text-brand-text mb-4">
                {feature.title}
              </h3>
              <p className="text-brand-muted leading-relaxed">
                {feature.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
