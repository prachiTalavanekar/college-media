require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('../models/Message');

async function cleanSelfMessages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all self-messages (where sender === recipient)
    const selfMessages = await Message.find({
      $expr: { $eq: ['$sender', '$recipient'] }
    })
      .populate('sender', 'name')
      .populate('recipient', 'name');

    console.log(`\n📊 Found ${selfMessages.length} self-messages:`);
    
    if (selfMessages.length > 0) {
      selfMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.sender.name} -> ${msg.recipient.name}`);
        console.log(`     Content: "${msg.content.substring(0, 50)}..."`);
        console.log(`     ID: ${msg._id}`);
      });

      // Delete all self-messages
      const result = await Message.deleteMany({
        $expr: { $eq: ['$sender', '$recipient'] }
      });

      console.log(`\n✅ Deleted ${result.deletedCount} self-messages`);
    } else {
      console.log('  No self-messages found!');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanSelfMessages();
