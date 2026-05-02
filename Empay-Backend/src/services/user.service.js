const User = require('../models/user.model');
const EmployeeProfile = require('../models/employeeProfile.model');
const resend = require('../../config/mail');
const { hashPassword } = require('../utils/hash');
const mongoose = require('mongoose');

/**
 * Invite a new user
 * Note: In a real app, you'd send a temporary password or a setup link.
 * Here we'll create the user with a temporary password and send an email.
 */
const inviteUser = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await hashPassword(tempPassword);

    const user = await User.create([{
      email: data.email,
      password: hashedPassword,
      role: data.role,
      status: 'PENDING',
    }], { session });

    await EmployeeProfile.create([{
      user: user[0]._id,
      employeeId: data.employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department,
      designation: data.designation,
      joiningDate: data.joiningDate,
    }], { session });

    // Send Invitation Email
    await resend.emails.send({
      from: 'EmPay <onboarding@resend.dev>',
      to: data.email,
      subject: 'Welcome to EmPay - Your Account is Ready',
      html: `
        <h1>Welcome ${data.firstName}!</h1>
        <p>Your account has been created on EmPay HRMS.</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>Please login and change your password immediately.</p>
      `,
    });

    await session.commitTransaction();
    return user[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const updateRole = async (userId, role) => {
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!user) throw new Error('User not found');
  return user;
};

const getAllUsers = async (query = {}) => {
  return User.find(query).select('-password');
};

module.exports = {
  inviteUser,
  updateRole,
  getAllUsers,
};
