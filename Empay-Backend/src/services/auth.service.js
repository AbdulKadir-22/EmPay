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

  if (user.status !== 'ACTIVE') {
    throw new Error('Account is not active');
  }

  const tokens = generateAuthTokens(user);
  
  user.lastLogin = new Date();
  await user.save();

  return { user, tokens };
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

module.exports = {
  register,
  login,
  refreshTokens,
  logout,
};
