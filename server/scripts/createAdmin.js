const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('❌ Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      name: 'System Administrator',
      email: 'admin@college.edu',
      password: 'admin123', // Will be hashed automatically by the model
      collegeId: 'ADMIN001',
      contactNumber: '+91-9999999999',
      department: 'Administration',
      course: 'Admin',
      batch: 'N/A',
      role: 'admin',
      verificationStatus: 'verified' // Admin is auto-verified
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@college.edu');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();