import React from 'react';
import { motion } from 'framer-motion';
import SignupForm from '../components/auth/SignupForm';
import GlassCard from '../components/ui/GlassCard';

const Signup = () => {
  return (
    <div className="min-h-screen relative flex items-center justify-center py-20 px-4 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-brand-purple/10 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -50, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-brand-green/10 blur-[120px] rounded-full"
        />
      </div>

      <div className="w-full max-w-2xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          {/* Logo Placeholder - Can be replaced with actual logo */}
          <div className="inline-flex items-center gap-3 mb-6">
            <img src="/Logo.png" alt="EmPay Logo" className="h-12 w-auto object-contain" />
            <span className="text-3xl font-extrabold tracking-tight text-brand-text font-syne">
              Em<span className="text-brand-purple">Pay</span>
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-brand-text mb-2 font-syne">
            Create Your Business Account
          </h1>
          <p className="text-brand-muted max-w-md mx-auto">
            Join thousands of businesses managing their payments with EmPay.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlassCard className="p-8 md:p-10 shadow-2xl">
            <SignupForm />
          </GlassCard>
        </motion.div>

        {/* Footer text */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-sm text-brand-muted"
        >
          By signing up, you agree to our{' '}
          <a href="/terms" className="hover:text-brand-purple underline transition-colors">Terms of Service</a> and{' '}
          <a href="/privacy" className="hover:text-brand-purple underline transition-colors">Privacy Policy</a>.
        </motion.p>
      </div>
    </div>
  );
};

export default Signup;
