const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
require('dotenv').config();

async function createTestPost() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: 'prachitalavanekar29@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('Found user:', user.name);

    // Create a test post
    const testPost = new Post({
      author: user._id,
      content: 'This is my first post on CollegeConnect! Excited to be part of this amazing community. Looking forward to connecting with fellow students and sharing knowledge. 🎓✨',
      postType: 'community_post',
      targetAudience: {
        departments: ['All'],
        courses: ['All'],
        batches: [],
        roles: ['all']
      },
      media: [],
      isActive: true
    });

    await testPost.save();
    console.log('✅ Test post created successfully!');
    console.log('Post ID:', testPost._id);

    // Create another test post (opportunity)
    const opportunityPost = new Post({
      author: user._id,
      content: 'Great internship opportunity at TechCorp! They are looking for talented students to join their development team. This is a fantastic chance to gain real-world experience.',
      postType: 'opportunity',
      targetAudience: {
        departments: ['Computer Science'],
        courses: ['B.Tech'],
        batches: ['2021-2025', '2022-2026'],
        roles: ['student']
      },
      opportunityDetails: {
        title: 'Software Development Intern',
        company: 'TechCorp',
        location: 'Bangalore',
        type: 'internship',
        applicationDeadline: new Date('2024-03-15'),
        requirements: [
          'Knowledge of JavaScript and React',
          'Understanding of databases',
          'Good problem-solving skills'
        ],
        contactEmail: 'hr@techcorp.com',
        externalLink: 'https://techcorp.com/careers'
      },
      media: [],
      isActive: true
    });

    await opportunityPost.save();
    console.log('✅ Opportunity post created successfully!');
    console.log('Post ID:', opportunityPost._id);

    // Check total posts
    const totalPosts = await Post.countDocuments({ isActive: true });
    console.log(`📊 Total active posts in database: ${totalPosts}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestPost();