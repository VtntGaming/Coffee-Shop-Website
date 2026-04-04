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
      await User.create({
        fullName: 'Admin',
        email: 'admin@coffee.com',
        password: '123456',
        phone: '0901234567',
        role: adminRole._id
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    mongoose.disconnect();
    console.log('Seed completed');
  } catch (error) {
    console.error('Seed error:', error);
    mongoose.disconnect();
  }
};

seedDB();
