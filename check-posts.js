const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect')
  .then(async () => {
    const Post = require('./models/Post');
    const User = require('./models/User');
    
    // Find the teacher user
    const teacher = await User.findOne({ role: 'teacher' });
    console.log('Teacher found:', teacher?.name, teacher?._id);
    
    if (teacher) {
      // Get all posts by this teacher
      const allPosts = await Post.find({ author: teacher._id });
      console.log('\nAll posts by teacher:');
      allPosts.forEach((post, index) => {
        console.log(`Post ${index + 1}:`);
        console.log(`  ID: ${post._id}`);
        console.log(`  Content: ${post.content.substring(0, 50)}...`);
        console.log(`  isActive: ${post.isActive}`);
        console.log(`  createdAt: ${post.createdAt}`);
        console.log('');
      });
      
      // Count active posts
      const activePosts = await Post.countDocuments({ 
        author: teacher._id, 
        isActive: true 
      });
      console.log(`Active posts count: ${activePosts}`);
      
      // Count all posts
      const totalPosts = await Post.countDocuments({ 
        author: teacher._id 
      });
      console.log(`Total posts count: ${totalPosts}`);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });