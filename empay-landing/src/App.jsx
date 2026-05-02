import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();

  // Determine if we're on a dashboard route (no landing navbar/footer)
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-brand-bg text-brand-text selection:bg-brand-purple/30 selection:text-brand-text transition-colors duration-500">
        {/* Show landing Navbar only on non-dashboard routes */}
        {!isDashboardRoute && <Navbar isDark={isDark} toggleTheme={toggleTheme} />}
        
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* Show Footer only on landing & auth pages */}
        {!isDashboardRoute && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
