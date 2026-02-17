const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
require('dotenv').config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB\n');

    // Find nigel
    const nigel = await User.findOne({ name: /nigel/i });
    console.log('Nigel user:');
    console.log('  ID:', nigel._id.toString());
    console.log('  Name:', nigel.name);
    console.log('  Email:', nigel.email);
    console.log('');

    // Find notifications for nigel
    const notifications = await Notification.find({ recipient: nigel._id })
      .populate('sender', 'name')
      .sort({ createdAt: -1 });

    console.log(`📊 Notifications for ${nigel.name}: ${notifications.length}\n`);

    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. Type: ${notif.type}`);
      console.log(`   From: ${notif.sender?.name || 'Unknown'}`);
      console.log(`   Title: ${notif.title}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Read: ${notif.read}`);
      console.log(`   Recipient ID: ${notif.recipient.toString()}`);
      console.log(`   Created: ${notif.createdAt}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

check();
