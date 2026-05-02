import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Building2, Briefcase, MapPin, Phone, Calendar, Shield, Sun, Moon, Loader2, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TABS = ['Resume', 'Private Info', 'Salary Info', 'Security'];

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Resume');
  const isSelf = !userId || userId === currentUser?._id;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await userAPI.getProfile(isSelf ? null : userId);
        setProfileData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId, isSelf]);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-brand-purple" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle size={28} className="text-red-500 mb-3" />
          <p className="text-brand-text font-medium">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const p = profileData?.profile || {};
  const sal = profileData?.salary;
  const fullName = p.firstName ? `${p.firstName} ${p.lastName || ''}`.trim() : profileData?.email;
  const initials = p.firstName ? `${p.firstName[0]}${p.lastName?.[0] || ''}`.toUpperCase() : '?';

  // Salary helpers
  const baseSalary = sal ? parseFloat(sal.baseSalary?.$numberDecimal || sal.baseSalary || 0) : 0;
  const monthly = baseSalary;
  const yearly = monthly * 12;
  const allowances = sal?.allowances || [];
  const deductions = sal?.deductions || [];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl lg:text-3xl font-bold text-brand-text font-syne">
          My Profile
        </motion.h1>
      </div>

      {/* Profile Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 lg:p-8 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-purple to-brand-green flex items-center justify-center text-white text-3xl font-bold shadow-xl">
              {initials}
            </div>
          </div>

          {/* Name & Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-brand-text font-syne">{fullName}</h2>
            <p className="text-sm text-brand-muted mt-0.5">{p.employeeId || 'No ID'}</p>
            <div className="flex flex-wrap gap-4 mt-3">
              <InfoChip icon={Mail} text={profileData?.email} />
              <InfoChip icon={Building2} text={profileData?.company} />
              <InfoChip icon={Briefcase} text={p.department} />
              <InfoChip icon={MapPin} text={p.designation} />
            </div>
          </div>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="p-3 rounded-xl bg-brand-surface border border-border text-brand-muted hover:text-brand-purple hover:border-brand-purple transition-all" title="Toggle Theme">
            <Sun size={20} className="dark:hidden" />
            <Moon size={20} className="hidden dark:block" />
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-brand-surface rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer
              ${activeTab === tab ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' : 'text-brand-muted hover:text-brand-text'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'Resume' && <ResumeTab profile={p} />}
        {activeTab === 'Private Info' && <PrivateInfoTab profile={p} />}
        {activeTab === 'Salary Info' && <SalaryInfoTab monthly={monthly} yearly={yearly} allowances={allowances} deductions={deductions} sal={sal} />}
        {activeTab === 'Security' && <SecurityTab email={profileData?.email} role={profileData?.role} lastLogin={profileData?.lastLogin} isSelf={isSelf} />}
      </motion.div>
    </DashboardLayout>
  );
};

const InfoChip = ({ icon: Icon, text }) => {
  if (!text) return null;
  return (
    <span className="flex items-center gap-1.5 text-xs text-brand-muted">
      <Icon size={14} className="text-brand-purple" />
      {text}
    </span>
  );
};

/* ── Resume Tab ── */
const ResumeTab = ({ profile }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <SectionCard title="About">
        <p className="text-sm text-brand-muted leading-relaxed">{profile.about || 'No information provided yet. Update your profile to add a bio.'}</p>
      </SectionCard>
      <SectionCard title="What I love about my job">
        <p className="text-sm text-brand-muted leading-relaxed">{profile.jobLove || 'Share what you love about your work here.'}</p>
      </SectionCard>
      <SectionCard title="My interests and hobbies">
        <p className="text-sm text-brand-muted leading-relaxed">{profile.hobbies || 'Add your interests and hobbies here.'}</p>
      </SectionCard>
    </div>
    <div className="space-y-6">
      <SectionCard title="Skills">
        <div className="flex flex-wrap gap-2">
          {(profile.skills || []).length > 0 ? profile.skills.map((s, i) => (
            <span key={i} className="px-3 py-1 rounded-lg bg-brand-purple/10 text-brand-purple text-xs font-medium">{s}</span>
          )) : <p className="text-xs text-brand-muted">+ Add Skills</p>}
        </div>
      </SectionCard>
      <SectionCard title="Certifications">
        <div className="space-y-2">
          {(profile.certifications || []).length > 0 ? profile.certifications.map((c, i) => (
            <div key={i} className="text-sm text-brand-text">{c}</div>
          )) : <p className="text-xs text-brand-muted">+ Add Skills</p>}
        </div>
      </SectionCard>
    </div>
  </div>
);

/* ── Private Info Tab ── */
const PrivateInfoTab = ({ profile }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <SectionCard title="Personal Information">
      <InfoRow label="Phone" value={profile.phone} />
      <InfoRow label="Employment Type" value={profile.employmentType?.replace('_', ' ')} />
      <InfoRow label="Joining Date" value={profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : '—'} />
    </SectionCard>
    <SectionCard title="Bank Details">
      <InfoRow label="Account Name" value={profile.bankDetails?.accountName} />
      <InfoRow label="Account Number" value={profile.bankDetails?.accountNumber} />
      <InfoRow label="Bank Name" value={profile.bankDetails?.bankName} />
      <InfoRow label="IFSC Code" value={profile.bankDetails?.ifscCode} />
    </SectionCard>
    <SectionCard title="Government IDs">
      <InfoRow label="PAN" value={profile.governmentIds?.pan} />
      <InfoRow label="Aadhaar" value={profile.governmentIds?.aadhaar} />
    </SectionCard>
  </div>
);

/* ── Salary Info Tab ── */
const SalaryInfoTab = ({ monthly, yearly, allowances, deductions, sal }) => (
  <div className="space-y-6">
    {/* Wage Summary */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="glass-card rounded-2xl p-6">
        <p className="text-xs text-brand-muted mb-1">Monthly Wage</p>
        <p className="text-2xl font-bold text-brand-text font-syne">₹{monthly.toLocaleString('en-IN')}<span className="text-sm font-normal text-brand-muted ml-1">/ Month</span></p>
      </div>
      <div className="glass-card rounded-2xl p-6">
        <p className="text-xs text-brand-muted mb-1">Yearly Wage</p>
        <p className="text-2xl font-bold text-brand-text font-syne">₹{yearly.toLocaleString('en-IN')}<span className="text-sm font-normal text-brand-muted ml-1">/ Yearly</span></p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Salary Components */}
      <SectionCard title="Salary Components">
        <SalaryRow label="Basic Salary" amount={monthly} pct={50} desc="Basic salary from company cost" />
        <SalaryRow label="House Rent Allowance" amount={monthly * 0.5} pct={50} desc="HRA provided to employees" />
        {allowances.map((a, i) => (
          <SalaryRow key={i} label={a.name} amount={parseFloat(a.amount?.$numberDecimal || a.amount || 0)} desc={a.isTaxable ? 'Taxable' : 'Non-taxable'} />
        ))}
      </SectionCard>

      {/* PF & Tax Deductions */}
      <div className="space-y-6">
        <SectionCard title="Provident Fund (PF) Contribution">
          <SalaryRow label="Employee" amount={monthly * 0.12} pct={12} desc="PF calculated on basic salary" />
          <SalaryRow label="Employer" amount={monthly * 0.12} pct={12} desc="PF calculated on basic salary" />
        </SectionCard>
        <SectionCard title="Tax Deductions">
          {deductions.map((d, i) => (
            <SalaryRow key={i} label={d.name} amount={parseFloat(d.amount?.$numberDecimal || d.amount || 0)} desc={d.isStatutory ? 'Statutory' : 'Voluntary'} />
          ))}
          {deductions.length === 0 && <p className="text-xs text-brand-muted">No deductions configured</p>}
        </SectionCard>
      </div>
    </div>
  </div>
);

/* ── Security Tab ── */
const SecurityTab = ({ email, role, lastLogin, isSelf }) => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SectionCard title="Account">
        <InfoRow label="Email" value={email} />
        <InfoRow label="Role" value={role?.replace('_', ' ')} />
        <InfoRow label="Last Login" value={lastLogin ? new Date(lastLogin).toLocaleString() : 'Never'} />
      </SectionCard>
      {isSelf && (
        <SectionCard title="Password">
          <p className="text-sm text-brand-muted mb-4">Change your password to keep your account secure.</p>
          <button
            onClick={() => navigate('/dashboard/change-password')}
            className="px-5 py-2.5 rounded-xl bg-brand-purple text-white text-sm font-semibold hover:bg-brand-purple/90 shadow-lg shadow-brand-purple/20 transition-colors cursor-pointer"
          >
            Change Password
          </button>
        </SectionCard>
      )}
    </div>
  );
};

/* ── Shared Components ── */
const SectionCard = ({ title, children }) => (
  <div className="glass-card rounded-2xl p-6">
    <h3 className="text-sm font-bold text-brand-text font-syne mb-4">{title}</h3>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2.5 border-b border-border last:border-0">
    <span className="text-xs text-brand-muted">{label}</span>
    <span className="text-sm text-brand-text font-medium">{value || '—'}</span>
  </div>
);

const SalaryRow = ({ label, amount = 0, pct, desc }) => (
  <div className="py-3 border-b border-border last:border-0">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-brand-text">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-brand-text">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        <span className="text-xs text-brand-muted">/ month</span>
        {pct !== undefined && <span className="text-xs text-brand-purple font-medium ml-1">{pct.toFixed(2)}%</span>}
      </div>
    </div>
    {desc && <p className="text-[11px] text-brand-muted mt-0.5">{desc}</p>}
  </div>
);

export default Profile;
