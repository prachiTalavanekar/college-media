const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Helper function to check if users are connected
async function areUsersConnected(user1Id, user2Id) {
  const user = await User.findById(user1Id);
  if (!user || !user.connections) return false;
  
  return user.connections.some(
    conn => conn.user.toString() === user2Id && conn.status === 'accepted'
  );
}

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id.toString(); // Convert to string for comparison
    
    console.log('=== CONVERSATIONS REQUEST ===');
    console.log('User ID:', userId);

    // Get all messages where user is sender or recipient (but not both)
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: { $ne: userId } },
        { recipient: userId, sender: { $ne: userId } }
      ]
    })
      .populate('sender', 'name profileImage role department')
      .populate('recipient', 'name profileImage role department')
      .sort({ createdAt: -1 })
      .lean(); // Use lean for better performance

    console.log('Total messages found:', messages.length);

    // Group messages by conversation partner
    const conversationsMap = new Map();

    messages.forEach(message => {
      // Check if sender and recipient are populated
      if (!message.sender || !message.recipient) {
        console.log('  Skipping message with missing user data');
        return;
      }

      const senderIdStr = message.sender._id.toString();
      const recipientIdStr = message.recipient._id.toString();
      
      // Determine who the conversation partner is
      const partnerId = senderIdStr === userId ? recipientIdStr : senderIdStr;
      
      // Skip if partner is the same as current user (self-messages)
      if (partnerId === userId) {
        console.log('  Skipping self-message:', partnerId);
        return;
      }
      
      if (!conversationsMap.has(partnerId)) {
        const partner = senderIdStr === userId ? message.recipient : message.sender;
        
        conversationsMap.set(partnerId, {
          partner,
          lastMessage: message,
          unreadCount: 0
        });
      }

      // Count unread messages from this partner
      if (recipientIdStr === userId && !message.read) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    // Convert map to array
    const conversations = Array.from(conversationsMap.values()).map(conv => ({
      id: conv.partner._id,
      name: conv.partner.name || 'Unknown User',
      profileImage: conv.partner.profileImage,
      role: conv.partner.role || 'User',
      department: conv.partner.department,
      lastMessage: conv.lastMessage.content,
      lastMessageTime: conv.lastMessage.createdAt,
      unreadCount: conv.unreadCount,
      online: false // TODO: Implement online status with WebSocket
    }));

    console.log('Final conversations count:', conversations.length);

    res.json({ conversations });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// @route   GET /api/messages/conversation/:userId
// @desc    Get conversation with specific user
// @access  Private
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id.toString(); // Convert to string
    const otherUserId = req.params.userId;

    // Check if users are connected
    const connected = await areUsersConnected(currentUserId, otherUserId);
    if (!connected) {
      return res.status(403).json({ 
        message: 'You can only message users you are connected with' 
      });
    }

    const { page = 1, limit = 50 } = req.query;

    // Get messages
    const messages = await Message.getConversation(currentUserId, otherUserId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Mark messages as read
    await Message.updateMany(
      { sender: otherUserId, recipient: currentUserId, read: false },
      { read: true, readAt: new Date() }
    );

    // Get other user info
    const otherUser = await User.findById(otherUserId)
      .select('name profileImage role department');

    res.json({
      messages,
      partner: otherUser
    });

  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/send
// @desc    Send a message
// @access  Private
router.post('/send', auth, async (req, res) => {
  try {
    const { recipientId, content, messageType = 'text', fileUrl, fileName } = req.body;
    const senderId = req.user.id.toString(); // Convert to string

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient and content are required' });
    }

    // Prevent sending messages to yourself
    if (recipientId === senderId) {
      return res.status(400).json({ message: 'You cannot send messages to yourself' });
    }

    // Check if users are connected
    const connected = await areUsersConnected(senderId, recipientId);
    if (!connected) {
      return res.status(403).json({ 
        message: 'You can only message users you are connected with' 
      });
    }

    // Create message
    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content,
      messageType,
      fileUrl: fileUrl || '',
      fileName: fileName || ''
    });

    await message.save();

    // Populate sender info
    await message.populate('sender', 'name profileImage role');
    await message.populate('recipient', 'name profileImage role');

    // TODO: Emit socket event for real-time delivery

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      recipient: req.user.id.toString() // Convert to string
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.markAsRead();

    res.json({ message: 'Message marked as read' });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/unread-count
// @desc    Get unread message count
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await Message.getUnreadCount(req.user.id.toString()); // Convert to string
    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      sender: req.user.id.toString() // Convert to string
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    await message.deleteOne();

    res.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
