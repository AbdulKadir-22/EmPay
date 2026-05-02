const User = require('../models/user.model');
const EmployeeProfile = require('../models/employeeProfile.model');
const resend = require('../config/mail');
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
      company: data.company,
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
  const match = {};
  
  if (query.company) {
    if (query.company === 'Default Company') {
      // If searching for default company, also include users with no company field
      match.$or = [
        { company: 'Default Company' },
        { company: { $exists: false } },
        { company: null }
      ];
    } else {
      match.company = query.company;
    }
  }
  
  if (query.role) match.role = query.role;

  return User.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'employeeprofiles',
        localField: '_id',
        foreignField: 'user',
        as: 'profile'
      }
    },
    { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        email: 1,
        role: 1,
        status: 1,
        company: 1,
        createdAt: 1,
        firstName: { $ifNull: ['$profile.firstName', ''] },
        lastName: { $ifNull: ['$profile.lastName', ''] },
        designation: { $ifNull: ['$profile.designation', ''] },
        department: { $ifNull: ['$profile.department', ''] },
        employeeId: { $ifNull: ['$profile.employeeId', ''] },
        avatar: { $ifNull: ['$profile.avatar', null] },
        name: {
          $ifNull: [
            { $concat: [{ $ifNull: ['$profile.firstName', ''] }, ' ', { $ifNull: ['$profile.lastName', ''] }] },
            'Unnamed User'
          ]
        }
      }
    },
    { $sort: { createdAt: -1 } }
  ]);
};

module.exports = {
  inviteUser,
  updateRole,
  getAllUsers,
};
