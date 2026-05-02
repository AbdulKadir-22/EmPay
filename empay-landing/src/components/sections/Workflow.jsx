import React from 'react';
import { motion } from 'framer-motion';

const Workflow = () => {
  const steps = [
    { num: '01', title: 'Register & Assign Role', desc: 'Admin creates accounts and assigns precise role-based access' },
    { num: '02', title: 'Mark Attendance', desc: 'Employees log attendance and submit leave applications' },
    { num: '03', title: 'HR Reviews', desc: 'HR Officer reviews requests and approves or flags issues' },
    { num: '04', title: 'Process Payroll', desc: 'Payroll Officer calculates salary, PF, PT and runs payroll' },
    { num: '05', title: 'Distribute Payslips', desc: 'Payslips auto-generated and available to each employee' },
  ];

  return (
    <section id="workflow" className="py-24 relative overflow-hidden bg-brand-bg transition-colors duration-500">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="text-brand-green font-mono text-sm tracking-[0.2em] uppercase mb-4">Process</div>
          <h2 className="font-syne font-extrabold text-4xl md:text-6xl text-brand-text mb-6 tracking-tight">
            The EmPay Workflow
          </h2>
          <p className="text-brand-muted text-lg max-w-2xl mx-auto">
            From onboarding to payslip — every step of your HR process, connected and automated.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-brand-purple/20 hidden lg:block -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-8">
                  <div className="w-16 h-16 rounded-full bg-brand-surface border-2 border-brand-purple flex items-center justify-center font-mono text-xl font-bold text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all duration-500 shadow-xl shadow-brand-purple/10">
                    {step.num}
                  </div>
                  {/* Pulsing indicator */}
                  <div className="absolute inset-0 rounded-full border-2 border-brand-purple animate-ping opacity-20" />
                </div>
                
                <h4 className="font-syne font-bold text-brand-text mb-3 text-lg leading-tight group-hover:text-brand-purple transition-colors">
                  {step.title}
                </h4>
                <p className="text-brand-muted text-sm leading-relaxed max-w-[200px]">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workflow;
