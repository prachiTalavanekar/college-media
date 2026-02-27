const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    const userId = req.user.id.toString();
    console.log('=== NOTIFICATIONS REQUEST ===');
    console.log('User ID from token:', userId);
    console.log('User ID type:', typeof userId);
    console.log('Query params:', { page, limit, unreadOnly });

    const filter = { recipient: req.user.id };
    if (unreadOnly === 'true') {
      filter.read = false;
    }

    console.log('Filter:', JSON.stringify(filter));

    // Check all notifications in database
    const allNotifications = await Notification.find({});
    console.log('Total notifications in DB:', allNotifications.length);
    allNotifications.forEach(n => {
      console.log('  - Recipient:', n.recipient.toString(), 'Type:', n.type);
    });

    const [notifications, totalCount, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate('sender', 'name profileImage role department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(filter),
      Notification.getUnreadCount(req.user.id)
    ]);

    console.log('Found notifications for user:', notifications.length);
    console.log('Total count:', totalCount);
    console.log('Unread count:', unreadCount);
    console.log('=== END NOTIFICATIONS REQUEST ===\n');

    res.json({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: skip + notifications.length < totalCount
      },
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notifications count
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.markAsRead();

    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/clear-all
// @desc    Clear all notifications
// @access  Private
router.delete('/clear-all', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notifications/community-join/:action
// @desc    Handle community join request from notification (approve/reject)
// @access  Private
router.post('/community-join/:action', auth, async (req, res) => {
  try {
    const { action } = req.params; // 'approve' or 'reject'
    const { notificationId, communityId, userId, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be approve or reject.' });
    }

    // Verify the notification belongs to the current user
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: req.user.id,
      type: 'community_join_request'
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Import required models
    const Community = require('../models/Community');
    const User = require('../models/User');

    const community = await Community.findById(communityId);
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is moderator
    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({ message: 'Only moderators can handle join requests' });
    }

    // Find the join request
    const requestIndex = community.joinRequests.findIndex(req => 
      req.user.toString() === userId && req.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Join request not found or already processed' });
    }

    const requestUser = await User.findById(userId);
    const moderator = await User.findById(req.user.id);

    if (action === 'approve') {
      // Approve the request
      community.joinRequests[requestIndex].status = 'approved';
      community.joinRequests[requestIndex].reviewedBy = req.user.id;
      community.joinRequests[requestIndex].reviewedAt = new Date();
      
      // Add user as member
      community.addMember(userId);
      
      await community.save();

      // Create approval notification
      await Notification.createNotification({
        recipient: userId,
        sender: req.user.id,
        type: 'community_join_approved',
        title: 'Community Join Request Approved',
        message: `Your request to join "${community.name}" has been approved by ${moderator.name}`,
        link: `/communities/${community._id}`,
        data: {
          communityId: community._id,
          communityName: community.name,
          approvedBy: moderator.name,
          approverRole: moderator.role
        }
      });

      // Mark the original notification as read
      await notification.markAsRead();

      res.json({ 
        message: 'Join request approved successfully',
        action: 'approved',
        user: {
          id: requestUser._id,
          name: requestUser.name,
          role: requestUser.role
        }
      });

    } else {
      // Reject the request
      community.joinRequests[requestIndex].status = 'rejected';
      community.joinRequests[requestIndex].reviewedBy = req.user.id;
      community.joinRequests[requestIndex].reviewedAt = new Date();
      
      await community.save();

      // Create rejection notification
      await Notification.createNotification({
        recipient: userId,
        sender: req.user.id,
        type: 'community_join_rejected',
        title: 'Community Join Request Rejected',
        message: `Your request to join "${community.name}" has been rejected${reason ? `: ${reason}` : ''}`,
        link: `/communities`,
        data: {
          communityId: community._id,
          communityName: community.name,
          rejectedBy: moderator.name,
          rejectorRole: moderator.role,
          reason: reason || ''
        }
      });

      // Mark the original notification as read
      await notification.markAsRead();

      res.json({ 
        message: 'Join request rejected successfully',
        action: 'rejected',
        user: {
          id: requestUser._id,
          name: requestUser.name,
          role: requestUser.role
        }
      });
    }

  } catch (error) {
    console.error('Error handling community join request:', error);
    res.status(500).json({ message: 'Server error while processing request' });
  }
});

module.exports = router;
