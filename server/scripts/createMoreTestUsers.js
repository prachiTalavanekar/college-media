const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createTestUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect');
    console.log('✅ Connected to MongoDB');

    const testUsers = [
      {
        name: 'Rahul Singh',
        email: 'rahul.singh@college.edu',
        password: 'password123',
        collegeId: '2023CS015',
        contactNumber: '+91-9876543211',
        department: 'Computer Science',
        course: 'B.Tech',
        batch: '2023-2027',
        role: 'student',
        verificationStatus: 'pending_verification'
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@college.edu',
        password: 'password123',
        collegeId: '2024EC002',
        contactNumber: '+91-9876543212',
        department: 'Electronics',
        course: 'B.Tech',
        batch: '2024-2028',
        role: 'student',
        verificationStatus: 'pending_verification'
      },
      {
        name: 'Dr. Amit Kumar',
        email: 'amit.kumar@college.edu',
        password: 'password123',
        collegeId: 'PROF001',
        contactNumber: '+91-9876543213',
        department: 'Computer Science',
        course: 'Other',
        batch: 'Faculty',
        role: 'teacher',
        verificationStatus: 'pending_verification'
      }
    ];

    for (const userData of testUsers) {
      try {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${user.name} (${user.email})`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`ℹ️ User already exists: ${userData.email}`);
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Test users creation completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

createTestUsers();