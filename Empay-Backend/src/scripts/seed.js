const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');
const EmployeeProfile = require('../models/employeeProfile.model');
const LeaveType = require('../models/leaveType.model');
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

    // 3. Seed Leave Types
    const leaveTypes = [
      { name: 'Sick Leave', code: 'SL', totalDays: 12, carryForward: true, maxCarryForward: 5 },
      { name: 'Casual Leave', code: 'CL', totalDays: 12, carryForward: false },
      { name: 'Paid Leave', code: 'PL', totalDays: 18, carryForward: true, maxCarryForward: 10 },
    ];

    for (const lt of leaveTypes) {
      await LeaveType.findOneAndUpdate({ code: lt.code }, lt, { upsert: true });
    }
    console.log('✅ Leave types seeded');

    // 4. Seed System Config
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
