const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// @route   POST /api/connections/request/:userId
// @desc    Send connection request
// @access  Private
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    console.log('Connection request:', { currentUserId, targetUserId });

    // Can't connect to yourself
    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Cannot connect to yourself' });
    }

    // Get both users
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);

    if (!currentUser) {
      console.error('Current user not found:', currentUserId);
      return res.status(404).json({ message: 'Current user not found' });
    }

    if (!targetUser) {
      console.error('Target user not found:', targetUserId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Users found:', { 
      currentUser: currentUser.name, 
      targetUser: targetUser.name 
    });

    // Initialize arrays if they don't exist
    if (!currentUser.connections) currentUser.connections = [];
    if (!currentUser.connectionRequestsSent) currentUser.connectionRequestsSent = [];
    if (!currentUser.connectionRequestsReceived) currentUser.connectionRequestsReceived = [];
    if (!targetUser.connections) targetUser.connections = [];
    if (!targetUser.connectionRequestsSent) targetUser.connectionRequestsSent = [];
    if (!targetUser.connectionRequestsReceived) targetUser.connectionRequestsReceived = [];

    // Check if already connected
    const alreadyConnected = currentUser.connections.some(
      conn => conn.user.toString() === targetUserId && conn.status === 'accepted'
    );

    if (alreadyConnected) {
      return res.status(400).json({ message: 'Already connected' });
    }

    // Check if request already sent
    const requestAlreadySent = currentUser.connectionRequestsSent.some(
      req => req.user.toString() === targetUserId
    );

    if (requestAlreadySent) {
      return res.status(400).json({ message: 'Connection request already sent' });
    }

    // Check if request already received (they sent you a request)
    const requestReceived = currentUser.connectionRequestsReceived.some(
      req => req.user.toString() === targetUserId
    );

    if (requestReceived) {
      console.log('Mutual request detected, auto-accepting');
      // Auto-accept if they already sent you a request
      await acceptConnectionRequest(currentUserId, targetUserId);
      return res.json({ 
        message: 'Connection accepted (mutual request)',
        status: 'accepted'
      });
    }

    // Add to sent requests
    currentUser.connectionRequestsSent.push({
      user: targetUserId,
      sentAt: new Date()
    });

    // Add to target user's received requests
    targetUser.connectionRequestsReceived.push({
      user: currentUserId,
      receivedAt: new Date()
    });

    await Promise.all([currentUser.save(), targetUser.save()]);

    console.log('Connection request saved, creating notification');

    // Create notification
    try {
      await Notification.createNotification({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${currentUser.name} wants to connect with you`,
        link: `/profile/${currentUserId}`,
        data: {
          senderName: currentUser.name,
          senderProfileImage: currentUser.profileImage,
          senderRole: currentUser.role
        }
      });
      console.log('Notification created successfully');
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail the request if notification fails
    }

    res.json({ 
      message: 'Connection request sent successfully',
      status: 'pending'
    });

  } catch (error) {
    console.error('Error sending connection request:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/connections/accept/:userId
// @desc    Accept connection request
// @access  Private
router.post('/accept/:userId', auth, async (req, res) => {
  try {
    const senderId = req.params.userId;
    const currentUserId = req.user.id;

    await acceptConnectionRequest(currentUserId, senderId);

    res.json({ message: 'Connection request accepted' });

  } catch (error) {
    console.error('Error accepting connection request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to accept connection
async function acceptConnectionRequest(userId, senderId) {
  const [user, sender] = await Promise.all([
    User.findById(userId),
    User.findById(senderId)
  ]);

  if (!user || !sender) {
    throw new Error('User not found');
  }

  // Initialize arrays if they don't exist
  if (!user.connectionRequestsReceived) user.connectionRequestsReceived = [];
  if (!user.connections) user.connections = [];
  if (!sender.connectionRequestsSent) sender.connectionRequestsSent = [];
  if (!sender.connections) sender.connections = [];

  // Remove from received requests
  user.connectionRequestsReceived = user.connectionRequestsReceived.filter(
    req => req.user.toString() !== senderId
  );

  // Remove from sender's sent requests
  sender.connectionRequestsSent = sender.connectionRequestsSent.filter(
    req => req.user.toString() !== userId
  );

  // Add to connections for both users
  user.connections.push({
    user: senderId,
    status: 'accepted',
    connectedAt: new Date()
  });

  sender.connections.push({
    user: userId,
    status: 'accepted',
    connectedAt: new Date()
  });

  await Promise.all([user.save(), sender.save()]);

  // Create notification for sender
  try {
    await Notification.createNotification({
      recipient: senderId,
      sender: userId,
      type: 'connection_accepted',
      title: 'Connection Accepted',
      message: `${user.name} accepted your connection request`,
      link: `/profile/${userId}`,
      data: {
        senderName: user.name,
        senderProfileImage: user.profileImage,
        senderRole: user.role
      }
    });
  } catch (notifError) {
    console.error('Error creating acceptance notification:', notifError);
    // Don't fail the request if notification fails
  }
}

// @route   POST /api/connections/reject/:userId
// @desc    Reject connection request
// @access  Private
router.post('/reject/:userId', auth, async (req, res) => {
  try {
    const senderId = req.params.userId;
    const currentUserId = req.user.id;

    const [user, sender] = await Promise.all([
      User.findById(currentUserId),
      User.findById(senderId)
    ]);

    if (!user || !sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize arrays if they don't exist
    if (!user.connectionRequestsReceived) user.connectionRequestsReceived = [];
    if (!sender.connectionRequestsSent) sender.connectionRequestsSent = [];

    // Remove from received requests
    user.connectionRequestsReceived = user.connectionRequestsReceived.filter(
      req => req.user.toString() !== senderId
    );

    // Remove from sender's sent requests
    sender.connectionRequestsSent = sender.connectionRequestsSent.filter(
      req => req.user.toString() !== currentUserId
    );

    await Promise.all([user.save(), sender.save()]);

    res.json({ message: 'Connection request rejected' });

  } catch (error) {
    console.error('Error rejecting connection request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/connections/remove/:userId
// @desc    Remove connection
// @access  Private
router.delete('/remove/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize arrays if they don't exist
    if (!currentUser.connections) currentUser.connections = [];
    if (!targetUser.connections) targetUser.connections = [];

    // Remove from both users' connections
    currentUser.connections = currentUser.connections.filter(
      conn => conn.user.toString() !== targetUserId
    );

    targetUser.connections = targetUser.connections.filter(
      conn => conn.user.toString() !== currentUserId
    );

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ message: 'Connection removed successfully' });

  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/connections
// @desc    Get user's connections
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('connections.user', 'name email role department course batch profileImage');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const connections = user.connections || [];
    const acceptedConnections = connections
      .filter(conn => conn.status === 'accepted' && conn.user)
      .map(conn => ({
        ...conn.user.toObject(),
        connectedAt: conn.connectedAt
      }));

    res.json({ connections: acceptedConnections });

  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/connections/requests
// @desc    Get connection requests
// @access  Private
router.get('/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('connectionRequestsReceived.user', 'name email role department course batch profileImage')
      .populate('connectionRequestsSent.user', 'name email role department course batch profileImage');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      received: user.connectionRequestsReceived || [],
      sent: user.connectionRequestsSent || []
    });

  } catch (error) {
    console.error('Error fetching connection requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/connections/status/:userId
// @desc    Get connection status with a user
// @access  Private
router.get('/status/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.json({ status: 'self' });
    }

    const user = await User.findById(currentUserId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize arrays if they don't exist
    const connections = user.connections || [];
    const connectionRequestsSent = user.connectionRequestsSent || [];
    const connectionRequestsReceived = user.connectionRequestsReceived || [];

    // Check if connected
    const isConnected = connections.some(
      conn => conn.user.toString() === targetUserId && conn.status === 'accepted'
    );

    if (isConnected) {
      return res.json({ status: 'connected' });
    }

    // Check if request sent
    const requestSent = connectionRequestsSent.some(
      req => req.user.toString() === targetUserId
    );

    if (requestSent) {
      return res.json({ status: 'pending' });
    }

    // Check if request received
    const requestReceived = connectionRequestsReceived.some(
      req => req.user.toString() === targetUserId
    );

    if (requestReceived) {
      return res.json({ status: 'received' });
    }

    res.json({ status: 'none' });

  } catch (error) {
    console.error('Error checking connection status:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
