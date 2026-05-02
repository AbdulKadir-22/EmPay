import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('empay_user');
    const storedTokens = localStorage.getItem('empay_tokens');

    if (storedUser && storedTokens) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const parsedTokens = JSON.parse(storedTokens);
        setUser(parsedUser);
        setTokens(parsedTokens);
      } catch {
        localStorage.removeItem('empay_user');
        localStorage.removeItem('empay_tokens');
      }
    }
    setLoading(false);
  }, []);

  // Set up axios interceptors
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const storedTokens = localStorage.getItem('empay_tokens');
        if (storedTokens) {
          try {
            const parsed = JSON.parse(storedTokens);
            config.headers.Authorization = `Bearer ${parsed.access.token}`;
          } catch { /* ignore */ }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const storedTokens = localStorage.getItem('empay_tokens');
            if (storedTokens) {
              const parsed = JSON.parse(storedTokens);
              const response = await authAPI.refreshToken(parsed.refresh.token);
              const newTokens = response.data.data.tokens;

              localStorage.setItem('empay_tokens', JSON.stringify(newTokens));
              setTokens(newTokens);
              
              originalRequest.headers.Authorization = `Bearer ${newTokens.access.token}`;
              return api(originalRequest);
            }
          } catch {
            // Refresh failed — logout
            handleLogout();
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { user: userData, tokens: tokenData } = response.data.data;

    setUser(userData);
    setTokens(tokenData);
    localStorage.setItem('empay_user', JSON.stringify(userData));
    localStorage.setItem('empay_tokens', JSON.stringify(tokenData));

    return userData;
  }, []);

  const handleLogout = useCallback(() => {
    // Try to call backend logout (fire and forget)
    try {
      authAPI.logout();
    } catch { /* ignore */ }

    setUser(null);
    setTokens(null);
    localStorage.removeItem('empay_user');
    localStorage.removeItem('empay_tokens');
    navigate('/login');
  }, [navigate]);

  const isAuthenticated = !!user && !!tokens;

  const value = {
    user,
    tokens,
    loading,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
