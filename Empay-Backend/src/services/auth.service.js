const User = require('../models/user.model');
const EmployeeProfile = require('../models/employeeProfile.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAuthTokens } = require('./token.service');
const { verifyRefreshToken } = require('../utils/jwt');
const mongoose = require('mongoose');

/**
 * Register a new user and employee profile
 */
const register = async (userData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(userData.password);

    // Handle full name splitting for landing page signups
    let { firstName, lastName, name } = userData;
    if (name && (!firstName || !lastName)) {
      const parts = name.trim().split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || parts[0];
    }

    const user = await User.create([{
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'ADMIN',
      status: 'ACTIVE',
      company: userData.companyName || 'Default Company',
    }], { session });

    await EmployeeProfile.create([{
      user: user[0]._id,
      employeeId: userData.employeeId || `EMP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      firstName: firstName || 'User',
      lastName: lastName || 'Account',
      department: userData.department || 'Management',
      designation: userData.designation || 'Administrator',
      joiningDate: userData.joiningDate || new Date(),
      companyName: userData.companyName,
    }], { session });

    await session.commitTransaction();
    return user[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Login user
 */
const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await comparePassword(password, user.password))) {
    throw new Error('Invalid email or password');
  }

  // Allow ACTIVE and PENDING, block INACTIVE/SUSPENDED
  if (!['ACTIVE', 'PENDING'].includes(user.status)) {
    throw new Error('Account is not active');
  }

  const tokens = generateAuthTokens(user);
  
  user.lastLogin = new Date();
  await user.save();

  const profile = await EmployeeProfile.findOne({ user: user._id });

  const userData = {
    _id: user._id,
    email: user.email,
    role: user.role,
    status: user.status,
    company: user.company,
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    designation: profile?.designation || '',
    department: profile?.department || '',
    avatar: profile?.avatar || null,
    requiresPasswordChange: user.status === 'PENDING',
  };

  return { user: userData, tokens };
};

/**
 * Refresh tokens
 */
const refreshTokens = async (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub);

  if (!user || user.tokenVersion !== payload.version) {
    throw new Error('Invalid refresh token');
  }

  return generateAuthTokens(user);
};

/**
 * Logout - increment token version to invalidate all current tokens
 */
const logout = async (userId) => {
  const user = await User.findById(userId);
  if (user) {
    user.tokenVersion += 1;
    await user.save();
  }
};

const mailService = require('./mail.service');

// ... existing code ...

/**
 * Forgot Password - Send OTP
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('No user found with this email');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await hashPassword(otp);
  
  user.otp = {
    hash: otpHash,
    expiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  };
  await user.save();

  await mailService.sendResetOTP(email, otp);
  return true;
};

/**
 * Verify OTP
 */
const verifyOTP = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user || !user.otp || !user.otp.hash) {
    throw new Error('Invalid request');
  }

  if (new Date() > user.otp.expiry) {
    throw new Error('OTP has expired');
  }

  const isValid = await comparePassword(otp, user.otp.hash);
  if (!isValid) {
    throw new Error('Invalid OTP');
  }

  return true;
};

/**
 * Reset Password
 */
const resetPassword = async (email, otp, newPassword) => {
  await verifyOTP(email, otp);
  
  const user = await User.findOne({ email });
  user.password = await hashPassword(newPassword);
  user.otp = undefined; // Clear OTP after use
  user.tokenVersion += 1; // Invalidate current tokens
  await user.save();

  return true;
};

/**
 * Change password for logged-in user. Activates PENDING accounts.
 */
const changePassword = async (userId, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new Error('User not found');

  user.password = await hashPassword(newPassword);
  if (user.status === 'PENDING') {
    user.status = 'ACTIVE';
  }
  user.tokenVersion += 1;
  await user.save();

  // Generate fresh tokens with new version
  const tokens = generateAuthTokens(user);

  const profile = await EmployeeProfile.findOne({ user: user._id });
  const userData = {
    _id: user._id,
    email: user.email,
    role: user.role,
    status: user.status,
    company: user.company,
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    designation: profile?.designation || '',
    department: profile?.department || '',
    avatar: profile?.avatar || null,
    requiresPasswordChange: false,
  };

  return { user: userData, tokens };
};

module.exports = {
  register,
  login,
  refreshTokens,
  logout,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
};
