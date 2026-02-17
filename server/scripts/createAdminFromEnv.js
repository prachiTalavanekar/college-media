const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load admin credentials from admin/.env
require('dotenv').config({ path: path.join(__dirname, '../../admin/.env') });

// Import User model
const User = require('../models/User');

const createAdminFromEnv = async () => {
  try {
    // Load server .env for database connection
    require('dotenv').config({ path: path.join(__dirname, '../.env') });

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect');
    console.log('✅ Connected to MongoDB');

    // Get admin credentials from admin/.env
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('❌ Admin credentials not found in admin/.env');
      console.log('Please ensure admin/.env has ADMIN_EMAIL and ADMIN_PASSWORD');
      process.exit(1);
    }

    console.log('📧 Admin Email from admin/.env:', adminEmail);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with this email');
      console.log('Updating password...');
      
      // Update password
      existingAdmin.password = adminPassword;
      existingAdmin.role = 'admin';
      existingAdmin.verificationStatus = 'verified';
      await existingAdmin.save();
      
      console.log('✅ Admin password updated successfully!');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password: (from admin/.env)');
    } else {
      // Create new admin user
      const adminData = {
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword, // Will be hashed automatically by the model
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
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password: (from admin/.env)');
    }

    console.log('\n✅ You can now login at: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error creating/updating admin:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createAdminFromEnv();
