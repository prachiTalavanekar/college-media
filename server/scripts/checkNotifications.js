const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Need to load User model
require('dotenv').config();

async function checkNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    const notifications = await Notification.find()
      .populate('sender', 'name')
      .populate('recipient', 'name')
      .sort({ createdAt: -1 });

    console.log(`\n📊 Total notifications: ${notifications.length}\n`);

    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. Type: ${notif.type}`);
      console.log(`   From: ${notif.sender?.name || 'Unknown'}`);
      console.log(`   To: ${notif.recipient?.name || 'Unknown'}`);
      console.log(`   Title: ${notif.title}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Read: ${notif.read}`);
      console.log(`   Created: ${notif.createdAt}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkNotifications();
