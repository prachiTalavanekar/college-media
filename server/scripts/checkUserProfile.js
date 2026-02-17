const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkUserProfile() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find user by email (assuming prachi's email)
    const user = await User.findOne({ email: 'prachitalavanekar29@gmail.com' });
    
    if (user) {
      console.log('User found:');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Profile Image:', user.profileImage);
      console.log('Profile Image Public ID:', user.profileImagePublicId);
      console.log('Phone:', user.phone);
      console.log('Location:', user.location);
      console.log('Department:', user.department);
      console.log('Course:', user.course);
      console.log('Batch:', user.batch);
      console.log('Bio:', user.bio);
    } else {
      console.log('User not found');
      
      // List all users to see what's available
      const allUsers = await User.find({}).select('name email profileImage');
      console.log('All users in database:');
      allUsers.forEach(u => {
        console.log(`- ${u.name} (${u.email}) - Profile Image: ${u.profileImage || 'None'}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkUserProfile();