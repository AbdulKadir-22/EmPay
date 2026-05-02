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
  changePassword: (newPassword) => api.post('/auth/change-password', { newPassword }),
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

export const attendanceAPI = {
  getTodayStatus: () => api.get('/attendance/today'),
  clockIn: () => api.post('/attendance/clock-in', {}),
  clockOut: () => api.post('/attendance/clock-out', {}),
  getSummary: (params) => api.get('/attendance/summary', { params }),
};

export const leaveAPI = {
  getTypes: () => api.get('/leaves/types'),
  getMyHistory: () => api.get('/leaves/my-history'),
  getMyAllocations: (year) => api.get('/leaves/my-allocations', { params: { year } }),
  request: (data) => api.post('/leaves/request', data),
  getPending: () => api.get('/leaves/pending'),
  updateStatus: (requestId, status, comment) => api.patch(`/leaves/${requestId}/status`, { status, comment }),
  createType: (data) => api.post('/leaves/types', data),
  allocate: (data) => api.post('/leaves/allocate', data),
};

export const employeeAPI = {
  getProfile: (userId) => api.get(userId ? `/employees/${userId}` : '/employees/me'),
  updateProfile: (userId, data) => api.patch(userId ? `/employees/${userId}` : '/employees/me', data),
};

export const payrollAPI = {
  getDashboard: () => api.get('/payroll/dashboard'),
  getSalaryStructure: (userId) => api.get(`/payroll/structure/${userId || ''}`),
  updateSalaryStructure: (userId, data) => api.patch(`/payroll/structure/${userId}`, data),
  getPayruns: () => api.get('/payroll/payruns'),
  getPayrun: (id) => api.get(`/payroll/payruns/${id}`),
  createPayrun: (data) => api.post('/payroll/payruns', data),
  processPayrun: (id) => api.post(`/payroll/payruns/${id}/process`),
  finalizePayrun: (id) => api.post(`/payroll/payruns/${id}/finalize`),
};

export const payslipAPI = {
  getMyPayslips: () => api.get('/payslips/me'),
  getPayslip: (id) => api.get(`/payslips/${id}`),
  getAll: () => api.get('/payslips'),
};

export default api;
