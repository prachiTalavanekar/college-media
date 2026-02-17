const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('❌ Admin user already exists:', existingAdmin.email);
      process.exit(1);
    }

    // Create admin user
    const adminData = {
      name: 'System Administrator',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
      course: 'N/A',
      batch: 'N/A',
      verificationStatus: 'verified',
      profileVisibility: 'public'
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Create user
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password: admin123');
    console.log('🔗 Login URL: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdminUser();