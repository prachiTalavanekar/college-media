const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const listAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all admin users
    const admins = await User.find({ role: 'admin' }).select('-password');
    
    console.log('\n📋 Admin Users:');
    console.log('================');
    
    if (admins.length === 0) {
      console.log('❌ No admin users found');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Status: ${admin.verificationStatus}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log('   ---');
      });
    }

  } catch (error) {
    console.error('❌ Error listing admin users:', error);
  } finally {
    mongoose.connection.close();
  }
};

listAdmins();