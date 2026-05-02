const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');
const EmployeeProfile = require('../models/employeeProfile.model');
const LeaveType = require('../models/leaveType.model');
const LeaveAllocation = require('../models/leaveAllocation.model');
const SystemConfig = require('../models/systemConfig.model');
const { hashPassword } = require('../utils/hash');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 Starting Seeding...');

    // 1. Clear existing data (Optional/Caution)
    // await User.deleteMany({});
    // await EmployeeProfile.deleteMany({});

    // 2. Seed Admin User
    const existingAdmin = await User.findOne({ email: 'admin@empay.com' });
    if (!existingAdmin) {
      const hashedPassword = await hashPassword('Admin@123');
      const admin = await User.create({
        email: 'admin@empay.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      await EmployeeProfile.create({
        user: admin._id,
        employeeId: 'EMP001',
        firstName: 'System',
        lastName: 'Administrator',
        department: 'Management',
        designation: 'Super Admin',
        joiningDate: new Date(),
      });
      console.log('✅ Admin user seeded (admin@empay.com / Admin@123)');
    }

    // Seed HR User
    const existingHR = await User.findOne({ email: 'hr@empay.com' });
    if (!existingHR) {
      const hashedPassword = await hashPassword('HR@123');
      const hr = await User.create({
        email: 'hr@empay.com',
        password: hashedPassword,
        role: 'HR',
        status: 'ACTIVE',
      });

      await EmployeeProfile.create({
        user: hr._id,
        employeeId: 'EMP002',
        firstName: 'Sarah',
        lastName: 'Jones',
        department: 'Human Resources',
        designation: 'HR Manager',
        joiningDate: new Date(),
      });
      console.log('✅ HR user seeded (hr@empay.com / HR@123)');
    }

    // Seed Employee User
    const existingEmp = await User.findOne({ email: 'employee@empay.com' });
    if (!existingEmp) {
      const hashedPassword = await hashPassword('Emp@123');
      const emp = await User.create({
        email: 'employee@empay.com',
        password: hashedPassword,
        role: 'EMPLOYEE',
        status: 'ACTIVE',
      });

      await EmployeeProfile.create({
        user: emp._id,
        employeeId: 'EMP003',
        firstName: 'John',
        lastName: 'Doe',
        department: 'Engineering',
        designation: 'Software Engineer',
        joiningDate: new Date(),
      });
      console.log('✅ Employee user seeded (employee@empay.com / Emp@123)');
    }

    // 3. Seed Leave Types (23 Paid Leave + 7 Sick Leave)
    const leaveTypes = [
      { name: 'Paid Leave', code: 'PL', totalDays: 23, carryForward: true, maxCarryForward: 10, description: 'Annual paid time off' },
      { name: 'Sick Leave', code: 'SL', totalDays: 7, carryForward: false, description: 'Medical / health related leave' },
    ];

    for (const lt of leaveTypes) {
      await LeaveType.findOneAndUpdate({ code: lt.code }, lt, { upsert: true });
    }
    console.log('✅ Leave types seeded (23 PL + 7 SL)');

    // 4. Auto-allocate leaves to ALL active users for current year
    const currentYear = new Date().getFullYear();
    const allUsers = await User.find({ status: 'ACTIVE' }).select('_id');
    const savedTypes = await LeaveType.find({ isActive: true });

    let allocCount = 0;
    for (const user of allUsers) {
      for (const lt of savedTypes) {
        await LeaveAllocation.findOneAndUpdate(
          { employee: user._id, leaveType: lt._id, year: currentYear },
          { $setOnInsert: { totalDays: lt.totalDays, remainingDays: lt.totalDays, usedDays: 0 } },
          { upsert: true, new: true }
        );
        allocCount++;
      }
    }
    console.log(`✅ Leave allocations seeded (${allocCount} records for ${allUsers.length} users)`);

    // 5. Seed System Config
    const configs = [
      { key: 'COMPANY_NAME', value: 'EmPay Inc.' },
      { key: 'STANDARD_WORK_HOURS', value: '8' },
      { key: 'PF_PERCENTAGE', value: '12' },
    ];

    for (const c of configs) {
      await SystemConfig.findOneAndUpdate({ key: c.key }, c, { upsert: true });
    }
    console.log('✅ System configurations seeded');

    console.log('✨ Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
};

seed();
