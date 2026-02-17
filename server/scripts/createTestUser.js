const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect');
    console.log('✅ Connected to MongoDB');

    // Create a test user for verification
    const testUser = new User({
      name: 'Test Student',
      email: 'test.student@college.edu',
      password: 'password123',
      collegeId: '2024CS001',
      contactNumber: '+91-9876543210',
      department: 'Computer Science',
      course: 'B.Tech',
      batch: '2024-2028',
      role: 'student',
      verificationStatus: 'pending_verification'
    });

    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log('📧 Email:', testUser.email);
    console.log('🆔 College ID:', testUser.collegeId);
    console.log('📱 Contact:', testUser.contactNumber);
    console.log('🎓 Department:', testUser.department);
    console.log('📚 Course:', testUser.course);
    console.log('📅 Batch:', testUser.batch);
    console.log('⏳ Status:', testUser.verificationStatus);

    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.log('ℹ️ Test user already exists');
    } else {
      console.error('❌ Error creating test user:', error.message);
    }
    process.exit(1);
  }
};

createTestUser();