const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function testAuthMe() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: 'prachitalavanekar29@gmail.com' }).select('-password');
    
    if (user) {
      console.log('Auth/me would return:');
      const authResponse = {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          course: user.course,
          batch: user.batch,
          collegeId: user.collegeId,
          contactNumber: user.contactNumber,
          phone: user.phone,
          location: user.location,
          verificationStatus: user.verificationStatus,
          profileImage: user.profileImage,
          profileImagePublicId: user.profileImagePublicId,
          bio: user.bio,
          currentCompany: user.currentCompany,
          jobTitle: user.jobTitle,
          graduationYear: user.graduationYear,
          profileVisibility: user.profileVisibility,
          showContactNumber: user.showContactNumber,
          joinedAt: user.joinedAt,
          lastActive: user.lastActive
        }
      };
      
      console.log(JSON.stringify(authResponse, null, 2));
    } else {
      console.log('User not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAuthMe();