const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const Community = require('../models/Community');
const User = require('../models/User');

async function addCreatorRole() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all communities without creatorRole
    const communities = await Community.find({ 
      $or: [
        { creatorRole: { $exists: false } },
        { creatorRole: null }
      ]
    }).populate('creator', 'role');

    console.log(`Found ${communities.length} communities without creatorRole`);

    let updated = 0;

    for (const community of communities) {
      if (community.creator && community.creator.role) {
        community.creatorRole = community.creator.role;
        
        // Also add visibleTo if it doesn't exist
        if (!community.visibleTo || !community.visibleTo.roles) {
          if (community.creator.role === 'teacher' || community.creator.role === 'principal') {
            community.visibleTo = {
              roles: ['student', 'teacher', 'principal'],
              departments: [],
              courses: []
            };
          } else if (community.creator.role === 'alumni') {
            community.visibleTo = {
              roles: ['student'],
              departments: [],
              courses: []
            };
          } else {
            community.visibleTo = {
              roles: ['all'],
              departments: [],
              courses: []
            };
          }
        }
        
        await community.save({ validateBeforeSave: false });
        console.log(`Updated community: ${community.name} - creatorRole: ${community.creatorRole}`);
        updated++;
      } else {
        console.log(`Skipping community ${community.name} - creator not found or has no role`);
      }
    }

    console.log(`✅ Updated ${updated} communities`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addCreatorRole();
