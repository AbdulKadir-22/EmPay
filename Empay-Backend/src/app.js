const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const requestIdMiddleware = require('./middlewares/requestId.middleware');
const loggerMiddleware = require('./middlewares/logger.middleware');
const errorMiddleware = require('./middlewares/error.middleware');
const apiRateLimiter = require('./middlewares/rateLimit.middleware');
const { formatResponse } = require('./utils/response.util');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Utility Middlewares
app.use(requestIdMiddleware);
app.use(loggerMiddleware);

// Rate Limiting
app.use('/api', apiRateLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json(formatResponse(true, 'Server is healthy', { uptime: process.uptime() }, null, req));
});

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const employeeRoutes = require('./routes/employee.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const leaveRoutes = require('./routes/leave.routes');
const payrollRoutes = require('./routes/payroll.routes');
const payslipRoutes = require('./routes/payslip.routes');
const reportRoutes = require('./routes/report.routes');
const notificationRoutes = require('./routes/notification.routes');
const configRoutes = require('./routes/config.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/payslips', payslipRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/config', configRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json(formatResponse(false, 'Route not found', null, { code: 'NOT_FOUND' }, req));
});

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
