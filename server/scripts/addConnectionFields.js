const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function addConnectionFields() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    // Update all users to add connection fields if they don't exist
    const result = await User.updateMany(
      {
        $or: [
          { connections: { $exists: false } },
          { connectionRequestsSent: { $exists: false } },
          { connectionRequestsReceived: { $exists: false } }
        ]
      },
      {
        $set: {
          connections: [],
          connectionRequestsSent: [],
          connectionRequestsReceived: []
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with connection fields`);

    // Verify the update
    const usersCount = await User.countDocuments();
    const usersWithConnections = await User.countDocuments({ 
      connections: { $exists: true },
      connectionRequestsSent: { $exists: true },
      connectionRequestsReceived: { $exists: true }
    });

    console.log(`📊 Total users: ${usersCount}`);
    console.log(`📊 Users with connection fields: ${usersWithConnections}`);

    if (usersCount === usersWithConnections) {
      console.log('✅ All users have connection fields!');
    } else {
      console.log('⚠️ Some users still missing connection fields');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addConnectionFields();
