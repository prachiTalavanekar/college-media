require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const initializeAboutSection = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users without an about section
    const users = await User.find({
      $or: [
        { about: { $exists: false } },
        { about: null }
      ]
    });

    console.log(`Found ${users.length} users without about section`);

    let updated = 0;
    for (const user of users) {
      // Initialize about section based on role
      user.about = {
        bio: user.bio || '',
        achievements: [],
        student: user.role === 'student' ? {
          projects: [],
          linkedIn: '',
          github: '',
          portfolio: ''
        } : undefined,
        teacher: user.role === 'teacher' ? {
          teachingExperience: [],
          researchWork: [],
          publications: [],
          specializations: []
        } : undefined,
        alumni: user.role === 'alumni' ? {
          workExperience: [],
          currentPosition: user.jobTitle || '',
          currentCompany: user.currentCompany || '',
          industry: '',
          linkedIn: '',
          expertise: []
        } : undefined
      };

      // Mark the about field as modified
      user.markModified('about');
      await user.save();
      updated++;
      
      if (updated % 10 === 0) {
        console.log(`Updated ${updated} users...`);
      }
    }

    console.log(`\n✅ Successfully initialized about section for ${updated} users`);
    process.exit(0);
  } catch (error) {
    console.error('Error initializing about section:', error);
    process.exit(1);
  }
};

initializeAboutSection();
