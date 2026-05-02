import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword }),
};

export const dashboardAPI = {
  getEmployees: () => api.get('/users/dashboard'),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  invite: (data) => api.post('/users/invite', data),
  update: (userId, data) => api.patch(`/users/${userId}`, data),
  updateRole: (userId, role) => api.patch(`/users/${userId}/role`, { role }),
  getProfile: (userId) => api.get(userId ? `/users/profile/${userId}` : '/users/profile/me'),
};

export const employeeAPI = {
  getProfile: (userId) => api.get(userId ? `/employees/${userId}` : '/employees/me'),
  updateProfile: (userId, data) => api.patch(userId ? `/employees/${userId}` : '/employees/me', data),
};

export default api;
