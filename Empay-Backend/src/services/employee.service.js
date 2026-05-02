const EmployeeProfile = require('../models/employeeProfile.model');
const User = require('../models/user.model');

const getEmployeeByUserId = async (userId) => {
  return EmployeeProfile.findOne({ user: userId }).populate('user', '-password').populate('manager', 'firstName lastName email');
};

const updateEmployeeProfile = async (userId, updateData) => {
  const profile = await EmployeeProfile.findOneAndUpdate(
    { user: userId },
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('user', '-password');
  
  if (!profile) throw new Error('Employee profile not found');
  return profile;
};

const deleteEmployee = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  user.status = 'INACTIVE';
  await user.save();
  
  return user;
};

const addDocument = async (userId, document) => {
  const profile = await EmployeeProfile.findOneAndUpdate(
    { user: userId },
    { $push: { documents: document } },
    { new: true }
  );
  if (!profile) throw new Error('Employee profile not found');
  return profile;
};

const getTeam = async (managerId) => {
  return EmployeeProfile.find({ manager: managerId }).populate('user', 'email status');
};

module.exports = {
  getEmployeeByUserId,
  updateEmployeeProfile,
  deleteEmployee,
  addDocument,
  getTeam,
};
