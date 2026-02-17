const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testAuthEndpoint() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: 'prachitalavanekar29@gmail.com' });
    
    if (user) {
      console.log('User found in database:');
      console.log('- Name:', user.name);
      console.log('- Email:', user.email);
      console.log('- Profile Image:', user.profileImage);
      
      // Generate a token for this user (simulate login)
      const payload = {
        user: {
          id: user._id,
          role: user.role,
          verificationStatus: user.verificationStatus
        }
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
      console.log('\n📝 Generated token for testing:', token.substring(0, 50) + '...');
      
      // Simulate what the /auth/me endpoint would return
      const authMeResponse = {
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
      
      console.log('\n🔍 /auth/me would return:');
      console.log('- Profile Image URL:', authMeResponse.user.profileImage);
      console.log('- Profile Image Public ID:', authMeResponse.user.profileImagePublicId);
      
      // Test if the image URL is accessible
      console.log('\n🌐 Testing image URL accessibility...');
      if (authMeResponse.user.profileImage) {
        console.log('Image URL:', authMeResponse.user.profileImage);
        console.log('✅ Image URL exists in database');
      } else {
        console.log('❌ No profile image URL found');
      }
      
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAuthEndpoint();