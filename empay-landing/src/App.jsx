import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Attendance from './pages/Attendance';
import TimeOff from './pages/TimeOff';
import Payroll from './pages/Payroll';
import PayrunPage from './pages/PayrunPage';
import PayslipView from './pages/PayslipView';
import Reports from './pages/Reports';
import SalarySetup from './pages/SalarySetup';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const location = useLocation();

  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-brand-bg text-brand-text selection:bg-brand-purple/30 selection:text-brand-text transition-colors duration-500">
          {!isDashboardRoute && <Navbar />}
          
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR']}><Settings /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/dashboard/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/dashboard/time-off" element={<ProtectedRoute><TimeOff /></ProtectedRoute>} />
            <Route path="/dashboard/payroll" element={<ProtectedRoute allowedRoles={['ADMIN', 'PAYROLL_OFFICER']}><Payroll /></ProtectedRoute>} />
            <Route path="/dashboard/payroll/payrun" element={<ProtectedRoute allowedRoles={['ADMIN', 'PAYROLL_OFFICER']}><PayrunPage /></ProtectedRoute>} />
            <Route path="/dashboard/payroll/payrun/:payrunId" element={<ProtectedRoute allowedRoles={['ADMIN', 'PAYROLL_OFFICER']}><PayrunPage /></ProtectedRoute>} />
            <Route path="/dashboard/payroll/payslip/:payslipId" element={<ProtectedRoute allowedRoles={['ADMIN', 'PAYROLL_OFFICER']}><PayslipView /></ProtectedRoute>} />
            <Route path="/dashboard/payroll/salary/:userId" element={<ProtectedRoute allowedRoles={['ADMIN', 'PAYROLL_OFFICER']}><SalarySetup /></ProtectedRoute>} />
            <Route path="/dashboard/reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'PAYROLL_OFFICER']}><Reports /></ProtectedRoute>} />
          </Routes>

          {!isDashboardRoute && <Footer />}
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
