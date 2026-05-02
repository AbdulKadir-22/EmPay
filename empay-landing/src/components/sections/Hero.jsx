import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight, CheckCircle, TrendingUp, Users } from 'lucide-react';
import Button from '../ui/Button';

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden transition-colors duration-500">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-brand-purple/5 dark:bg-brand-purple/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-brand-green/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] dark:opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-bold tracking-widest uppercase mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
              </span>
              Odoo × VIT Pune Hackathon 2026
            </div>
            
            <h1 className="font-syne font-extrabold text-5xl md:text-7xl lg:text-8xl text-brand-text leading-[0.9] tracking-tighter mb-8">
              Smarter HR.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-purple/50 italic">Simpler</span> Payroll.
            </h1>
            
            <p className="text-brand-muted text-lg md:text-xl leading-relaxed max-w-xl mb-12">
              EmPay unifies attendance, leave, and payroll into one intelligent HRMS built for modern workplaces. Four roles. Zero chaos.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button href="#features"variant="primary" className="group">
                Explore Features
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="group">
                View Flow
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>

          {/* Right Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            {/* Main Card */}
            <div className="relative z-10 glass-card p-6 md:p-8 rounded-[2.5rem] shadow-2xl border-white/5 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/20 via-transparent to-brand-green/10 opacity-50" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="text-[10px] font-mono text-brand-muted tracking-widest uppercase">
                    EMPAY — DASHBOARD
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-brand-bg/40 dark:bg-white/5 rounded-2xl p-4 border border-border">
                    <div className="text-[10px] font-mono text-brand-muted mb-2">ATTENDANCE</div>
                    <div className="text-3xl font-bold text-brand-green">92%</div>
                  </div>
                  <div className="bg-brand-bg/40 dark:bg-white/5 rounded-2xl p-4 border border-border">
                    <div className="text-[10px] font-mono text-brand-muted mb-2">ON LEAVE</div>
                    <div className="text-3xl font-bold text-brand-purple">04</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { label: 'Payroll Processed', val: 86, color: 'brand-green' },
                    { label: 'Leave Approvals', val: 71, color: 'brand-purple' },
                    { label: 'Active Employees', val: 94, color: 'brand-green' }
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-mono text-brand-muted mb-2">
                        <span>{stat.label}</span>
                        <span>{stat.val}%</span>
                      </div>
                      <div className="h-2 w-full bg-brand-bg/40 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.val}%` }}
                          transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                          className={`h-full bg-${stat.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-4 md:-right-10 z-20 glass-morphism p-4 rounded-2xl shadow-xl flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center">
                <CheckCircle className="text-brand-green w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-brand-green">3 Approved</div>
                <div className="text-[10px] text-brand-muted">Leave Requests</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 -left-4 md:-left-10 z-20 glass-morphism p-4 rounded-2xl shadow-xl flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center">
                <TrendingUp className="text-brand-purple w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-brand-purple">₹2.4L</div>
                <div className="text-[10px] text-brand-muted">Payrun Generated</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/2 -right-8 md:-right-20 -translate-y-1/2 z-20 glass-morphism p-4 rounded-2xl shadow-xl flex items-center gap-3 hidden md:flex"
            >
              <div className="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center">
                <Users className="text-brand-green w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-brand-green">↑ 98%</div>
                <div className="text-[10px] text-brand-muted">Present Today</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
