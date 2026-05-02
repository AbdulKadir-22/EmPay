import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChangePassword = () => {
  const { user, login: updateAuth } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.changePassword(formData.newPassword);
      const { user: userData, tokens } = response.data.data;

      // Update stored auth with new tokens and activated user
      localStorage.setItem('empay_user', JSON.stringify(userData));
      localStorage.setItem('empay_tokens', JSON.stringify(tokens));

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-20 px-4 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-brand-purple/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-brand-green/10 blur-[120px] rounded-full"
        />
      </div>

      <div className="w-full max-w-lg relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-purple/10 mb-4">
            <ShieldCheck size={32} className="text-brand-purple" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-text mb-2 font-syne">
            Set Your Password
          </h1>
          <p className="text-brand-muted max-w-md mx-auto">
            Welcome to EmPay! Please set a new password to activate your account.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <GlassCard className="p-8 md:p-10 shadow-2xl" hoverEffect={false}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {success && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-brand-green/10 border border-brand-green/20 text-brand-green p-4 rounded-xl text-center">
                  Password set successfully! Redirecting to dashboard...
                </motion.div>
              )}

              {errors.server && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-center">
                  {errors.server}
                </motion.div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Lock size={18} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-500">
                  You're using a temporary password. Set a new one to activate your account.
                </p>
              </div>

              <Input label="New Password" name="newPassword" type="password" placeholder="••••••••"
                value={formData.newPassword} onChange={handleChange} error={errors.newPassword} />

              <Input label="Confirm New Password" name="confirmPassword" type="password" placeholder="••••••••"
                value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="mt-2">
                <Button type="submit" fullWidth variant="primary" className="py-4 text-lg"
                  disabled={loading || success}>
                  {loading ? 'Setting Password...' : success ? 'Success!' : 'Set Password & Activate'}
                </Button>
              </motion.div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default ChangePassword;
