const User = require('../models/user.model');
const EmployeeProfile = require('../models/employeeProfile.model');
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
    const tempPassword = data.email.split('@')[0] + '@123';
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

    await session.commitTransaction();
    return { user: user[0], tempPassword };
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

const updateUser = async (userId, updateData, callerCompany) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.company !== callerCompany) throw new Error('Cannot modify users from another company');

  // Update user fields
  if (updateData.role) user.role = updateData.role;
  if (updateData.status) user.status = updateData.status;
  await user.save();

  // Update profile fields if provided
  const profileFields = {};
  if (updateData.firstName) profileFields.firstName = updateData.firstName;
  if (updateData.lastName) profileFields.lastName = updateData.lastName;
  if (updateData.department) profileFields.department = updateData.department;
  if (updateData.designation) profileFields.designation = updateData.designation;
  if (updateData.phone) profileFields.phone = updateData.phone;

  if (Object.keys(profileFields).length > 0) {
    await EmployeeProfile.findOneAndUpdate(
      { user: userId },
      { $set: profileFields },
      { new: true }
    );
  }

  return user;
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const profile = await EmployeeProfile.findOne({ user: userId })
    .populate('manager', 'email');
  
  // Try loading salary structure
  let salary = null;
  try {
    const SalaryStructure = require('../models/salaryStructure.model');
    salary = await SalaryStructure.findOne({ employee: userId });
  } catch { /* salary model might not be seeded yet */ }

  return {
    _id: user._id,
    email: user.email,
    role: user.role,
    status: user.status,
    company: user.company,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    profile: profile || null,
    salary: salary || null,
  };
};

module.exports = {
  inviteUser,
  updateRole,
  getAllUsers,
  updateUser,
  getUserProfile,
};
