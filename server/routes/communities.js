const express = require('express');
const { body, validationResult } = require('express-validator');
const Community = require('../models/Community');
const User = require('../models/User');
const { auth, requireVerified, canCreateCommunity } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/communities
// @desc    Get communities for user
// @access  Private
router.get('/', auth, requireVerified, async (req, res) => {
  try {
    const { page = 1, limit = 20, type = 'all', search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = { isActive: true };
    
    if (type !== 'all') {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const communities = await Community.find(filter)
      .populate('creator', 'name role')
      .populate('moderators', 'name role')
      .sort({ 'stats.totalMembers': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get user to check eligibility and membership
    const user = await User.findById(req.user.id);

    const communitiesWithStatus = communities.map(community => ({
      ...community.toObject(),
      canJoin: community.canUserJoin(user),
      isMember: community.isMember(req.user.id),
      isModerator: community.isModerator(req.user.id)
    }));

    res.json({
      communities: communitiesWithStatus,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(communities.length / limit),
        hasMore: communities.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({ message: 'Server error while fetching communities' });
  }
});

// @route   POST /api/communities
// @desc    Create a new community
// @access  Private (Teachers, Principals, Admins only)
router.post('/', [
  auth,
  requireVerified,
  canCreateCommunity,
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Community name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('type').isIn(['department', 'course', 'batch', 'club', 'opportunities', 'events', 'general']).withMessage('Invalid community type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      name,
      description,
      type,
      isPrivate = false,
      requiresApproval = false,
      eligibility = {},
      rules = []
    } = req.body;

    // Check if community with same name already exists
    const existingCommunity = await Community.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      isActive: true 
    });

    if (existingCommunity) {
      return res.status(400).json({ message: 'A community with this name already exists' });
    }

    // Create community
    const community = new Community({
      name: name.trim(),
      description: description.trim(),
      type,
      creator: req.user.id,
      moderators: [req.user.id],
      isPrivate,
      requiresApproval,
      eligibility: {
        departments: eligibility.departments || [],
        courses: eligibility.courses || [],
        batches: eligibility.batches || [],
        roles: eligibility.roles || []
      },
      rules: rules.map(rule => ({
        title: rule.title?.trim(),
        description: rule.description?.trim()
      }))
    });

    // Add creator as first member
    community.addMember(req.user.id);
    
    await community.save();

    // Populate creator info for response
    await community.populate('creator', 'name role');

    res.status(201).json({
      message: 'Community created successfully',
      community
    });

  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({ message: 'Server error while creating community' });
  }
});

// @route   GET /api/communities/:id
// @desc    Get a specific community
// @access  Private
router.get('/:id', auth, requireVerified, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('creator', 'name role department course batch profileImage')
      .populate('moderators', 'name role department course batch profileImage')
      .populate('members.user', 'name role department course batch profileImage');

    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user can view this community
    const user = await User.findById(req.user.id);
    const isMember = community.isMember(req.user.id);
    const canJoin = community.canUserJoin(user);

    if (community.isPrivate && !isMember) {
      return res.status(403).json({ message: 'This is a private community' });
    }

    res.json({
      community: {
        ...community.toObject(),
        canJoin,
        isMember,
        isModerator: community.isModerator(req.user.id)
      }
    });

  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({ message: 'Server error while fetching community' });
  }
});

// @route   POST /api/communities/:id/join
// @desc    Join a community
// @access  Private
router.post('/:id/join', auth, requireVerified, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if already a member
    if (community.isMember(req.user.id)) {
      return res.status(400).json({ message: 'You are already a member of this community' });
    }

    // Check eligibility
    const user = await User.findById(req.user.id);
    if (!community.canUserJoin(user)) {
      return res.status(403).json({ message: 'You are not eligible to join this community' });
    }

    if (community.requiresApproval) {
      // Add to join requests
      const existingRequest = community.joinRequests.find(req => 
        req.user.toString() === req.user.id
      );

      if (existingRequest) {
        return res.status(400).json({ message: 'You have already requested to join this community' });
      }

      community.joinRequests.push({
        user: req.user.id,
        message: req.body.message || ''
      });

      await community.save();

      res.json({ message: 'Join request sent successfully. Please wait for approval.' });
    } else {
      // Join immediately
      community.addMember(req.user.id);
      await community.save();

      res.json({ message: 'Successfully joined the community' });
    }

  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({ message: 'Server error while joining community' });
  }
});

// @route   POST /api/communities/:id/leave
// @desc    Leave a community
// @access  Private
router.post('/:id/leave', auth, requireVerified, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is a member
    if (!community.isMember(req.user.id)) {
      return res.status(400).json({ message: 'You are not a member of this community' });
    }

    // Check if user is the creator
    if (community.creator.toString() === req.user.id) {
      return res.status(400).json({ 
        message: 'Community creator cannot leave. Please transfer ownership or delete the community.' 
      });
    }

    // Remove from members and moderators
    community.removeMember(req.user.id);
    community.moderators = community.moderators.filter(mod => 
      mod.toString() !== req.user.id
    );

    await community.save();

    res.json({ message: 'Successfully left the community' });

  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({ message: 'Server error while leaving community' });
  }
});

// @route   POST /api/communities/:id/approve-request
// @desc    Approve join request
// @access  Private (Moderators only)
router.post('/:id/approve-request', auth, requireVerified, async (req, res) => {
  try {
    const { userId } = req.body;
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is moderator
    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({ message: 'Only moderators can approve join requests' });
    }

    // Find and remove the join request
    const requestIndex = community.joinRequests.findIndex(req => 
      req.user.toString() === userId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    community.joinRequests.splice(requestIndex, 1);
    community.addMember(userId);

    await community.save();

    res.json({ message: 'Join request approved successfully' });

  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ message: 'Server error while approving request' });
  }
});

// @route   POST /api/communities/:id/reject-request
// @desc    Reject join request
// @access  Private (Moderators only)
router.post('/:id/reject-request', auth, requireVerified, async (req, res) => {
  try {
    const { userId } = req.body;
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is moderator
    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({ message: 'Only moderators can reject join requests' });
    }

    // Find and remove the join request
    const requestIndex = community.joinRequests.findIndex(req => 
      req.user.toString() === userId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    community.joinRequests.splice(requestIndex, 1);
    await community.save();

    res.json({ message: 'Join request rejected successfully' });

  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ message: 'Server error while rejecting request' });
  }
});

// @route   DELETE /api/communities/:id
// @desc    Delete a community
// @access  Private (Creator or Admin only)
router.delete('/:id', auth, requireVerified, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is creator or admin
    if (community.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the creator or admin can delete this community' });
    }

    // Soft delete
    community.isActive = false;
    await community.save();

    res.json({ message: 'Community deleted successfully' });

  } catch (error) {
    console.error('Delete community error:', error);
    res.status(500).json({ message: 'Server error while deleting community' });
  }
});

module.exports = router;