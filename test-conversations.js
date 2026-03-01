// Test script to check conversations endpoint
const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const Message = require('./server/models/Message');
const User = require('./server/models/User');

async function testConversations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a test user
    const user = await User.findOne();
    if (!user) {
      console.log('No users found in database');
      process.exit(0);
    }

    console.log('Testing with user:', user.name, user._id);

    const userId = user._id.toString();

    // Get all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: { $ne: userId } },
        { recipient: userId, sender: { $ne: userId } }
      ]
    })
      .populate('sender', 'name profileImage role department')
      .populate('recipient', 'name profileImage role department')
      .sort({ createdAt: -1 });

    console.log('Total messages found:', messages.length);

    if (messages.length > 0) {
      console.log('Sample message:', {
        sender: messages[0].sender?.name,
        recipient: messages[0].recipient?.name,
        content: messages[0].content.substring(0, 50)
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testConversations();
