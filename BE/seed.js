// seed.js - Chạy: node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Role = require('./models/Role');
const User = require('./models/User');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Tạo Roles
    const adminRole = await Role.findOneAndUpdate(
      { name: 'ADMIN' },
      { name: 'ADMIN', description: 'Quản trị viên' },
      { upsert: true, new: true }
    );

    const staffRole = await Role.findOneAndUpdate(
      { name: 'STAFF' },
      { name: 'STAFF', description: 'Nhân viên' },
      { upsert: true, new: true }
    );

    console.log('Roles created:', adminRole.name, staffRole.name);

    // Tạo Admin user
    const existingAdmin = await User.findOne({ email: 'admin@coffee.com' });
    if (!existingAdmin) {
      const admin = await User.create({
        fullName: 'Admin Coffee',
        email: 'admin@coffee.com',
        password: '123456',
        phone: '0912345678',
        role: adminRole._id
      });
      console.log('Admin user created:', admin.email);
    }

    // Tạo Admin test user cho Postman
    const existingTestAdmin = await User.findOne({ email: 'admin@test.com' });
    if (!existingTestAdmin) {
      const testAdmin = await User.create({
        fullName: 'Admin User',
        email: 'admin@test.com',
        password: '123456',
        phone: '0912345678',
        role: adminRole._id
      });
      console.log('Test admin user created:', testAdmin.email, '(role: ADMIN)');
    } else {
      // Nếu user đã tồn tại nhưng không phải ADMIN, update lại role
      if (!existingTestAdmin.role || existingTestAdmin.role.toString() !== adminRole._id.toString()) {
        existingTestAdmin.role = adminRole._id;
        await existingTestAdmin.save();
        console.log('Test admin user role updated to ADMIN');
      }
    }

    mongoose.disconnect();
    console.log('✅ Seed completed!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    mongoose.disconnect();
  }
};

seedDB();
