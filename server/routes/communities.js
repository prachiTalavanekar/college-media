const express = require('express');
const { body, validationResult } = require('express-validator');
const Community = require('../models/Community');
const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');
const { auth, requireVerified, canCreateCommunity } = require('../middleware/auth');
const { uploadStudyMaterial } = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

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
      .populate('members.user', 'name role')
      .sort({ 'stats.totalMembers': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get user to check eligibility and membership
    const user = await User.findById(req.user.id);

    // Filter communities based on visibility
    const visibleCommunities = communities.filter(community => {
      // Creator should always see their own community
      if (community.creator._id.toString() === user._id.toString()) {
        return true;
      }
      
      // Members should always see communities they're part of
      if (community.isMember(req.user.id)) {
        return true;
      }
      
      // Teacher communities should not be visible to alumni
      if (community.creatorRole === 'teacher' && user.role === 'alumni') {
        return false;
      }
      
      // Check custom visibility settings
      return community.isVisibleTo(user);
    });

    const communitiesWithStatus = visibleCommunities.map(community => {
      const isMember = community.isMember(req.user.id);
      const isModerator = community.isModerator(req.user.id);
      const canAccessContent = isMember || isModerator;
      
      return {
        ...community.toObject(),
        canJoin: community.canUserJoin(user),
        isMember,
        isModerator,
        canAccessContent,
        hasPendingRequest: community.joinRequests.some(req => 
          req.user.toString() === user._id.toString() && req.status === 'pending'
        )
      };
    });

    res.json({
      communities: communitiesWithStatus,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(visibleCommunities.length / limit),
        hasMore: visibleCommunities.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({ message: 'Server error while fetching communities' });
  }
});

// @route   POST /api/communities
// @desc    Create a new community
// @access  Private (Teachers, Principals, Admins, Alumni)
router.post('/', [
  auth,
  requireVerified,
  canCreateCommunity,
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Community name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('type').isIn(['department', 'course', 'batch', 'club', 'opportunities', 'events', 'general', 'subject', 'project', 'alumni_mentorship', 'alumni_jobs']).withMessage('Invalid community type')
], async (req, res) => {
  try {
    console.log('Create community request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
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
      visibleTo = {},
      rules = [],
      purpose = '',
      academicSettings = {}
    } = req.body;

    // Get creator info
    const creator = await User.findById(req.user.id);
    
    // Check if community with same name already exists
    const existingCommunity = await Community.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      isActive: true 
    });

    if (existingCommunity) {
      return res.status(400).json({ message: 'A community with this name already exists' });
    }

    // Set default visibility based on creator role
    let defaultVisibility = visibleTo;
    if (creator.role === 'teacher' || creator.role === 'principal') {
      // Teacher communities: visible to students and teachers only (not alumni)
      defaultVisibility = {
        roles: visibleTo.roles || ['student', 'teacher', 'principal'],
        departments: visibleTo.departments || [],
        courses: visibleTo.courses || []
      };
    } else if (creator.role === 'alumni') {
      // Alumni communities: visible to students only (customizable)
      defaultVisibility = {
        roles: visibleTo.roles || ['student'],
        departments: visibleTo.departments || [],
        courses: visibleTo.courses || []
      };
    }

    // Create community
    const community = new Community({
      name: name.trim(),
      description: description.trim(),
      type,
      creator: req.user.id,
      creatorRole: creator.role,
      moderators: [{
        user: req.user.id,
        assignedAt: new Date(),
        assignedBy: req.user.id
      }],
      isPrivate,
      requiresApproval,
      purpose: purpose.trim(),
      eligibility: {
        departments: eligibility.departments || [],
        courses: eligibility.courses || [],
        batches: eligibility.batches || [],
        roles: eligibility.roles || []
      },
      visibleTo: defaultVisibility,
      rules: rules.map(rule => ({
        title: rule.title?.trim(),
        description: rule.description?.trim(),
        createdAt: new Date()
      })),
      academicSettings: {
        subject: academicSettings.subject || '',
        semester: academicSettings.semester || '',
        academicYear: academicSettings.academicYear || '',
        allowStudentPosts: academicSettings.allowStudentPosts !== false,
        allowFileUploads: academicSettings.allowFileUploads !== false,
        allowPolls: academicSettings.allowPolls !== false,
        moderationLevel: academicSettings.moderationLevel || 'medium'
      }
    });

    // Add creator as first member
    community.addMember(req.user.id, 'admin');
    
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
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isMember = community.isMember(req.user.id);
    const canJoin = community.canUserJoin(user);
    const isModerator = community.isModerator(req.user.id);
    const canAccessContent = isMember || isModerator; // Simplified: members and moderators can access

    console.log('Community Detail API - User:', user.name, 'Community:', community.name); // Debug log
    console.log('Community Detail - Members:', community.members.map(m => ({
      userId: m.user._id ? m.user._id.toString() : m.user.toString(),
      name: m.user.name || 'Unknown',
      role: m.role
    })));
    console.log('Community Detail - Current User ID:', req.user.id);
    console.log('Access checks:', { isMember, canAccessContent, isModerator, canJoin }); // Debug log

    // For debugging: Always allow access if user is a member
    const forceAccess = isMember || isModerator;

    if (community.isPrivate && !isMember) {
      return res.status(403).json({ message: 'This is a private community' });
    }

    const responseData = {
      ...community.toObject(),
      canJoin,
      isMember,
      isModerator,
      canAccessContent: forceAccess, // Force access for members and moderators
      hasPendingRequest: community.joinRequests.some(req => 
        req.user.toString() === user._id.toString() && req.status === 'pending'
      )
    };

    console.log('Sending response with access flags:', { 
      canAccessContent: responseData.canAccessContent, 
      isModerator: responseData.isModerator,
      isMember: responseData.isMember,
      forceAccess
    }); // Debug log

    res.json({
      community: responseData
    });

  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({ message: 'Server error while fetching community' });
  }
});

// @route   POST /api/communities/:id/join
// @desc    Request to join a community (always requires approval)
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
    console.log('Join community - User data:', {
      id: user._id,
      name: user.name,
      role: user.role,
      department: user.department,
      course: user.course,
      batch: user.batch
    });
    console.log('Join community - Community eligibility:', community.eligibility);
    
    const canJoin = community.canUserJoin(user);
    console.log('Join community - Can user join:', canJoin);
    
    if (!canJoin) {
      // Get detailed eligibility information for better error message
      const eligibilityDetails = community.getEligibilityDetails(user);
      const detailedMessage = eligibilityDetails.reasons.length > 0 
        ? `You are not eligible to join this community. Requirements not met: ${eligibilityDetails.reasons.join('; ')}`
        : 'You are not eligible to join this community';
      
      return res.status(403).json({ message: detailedMessage });
    }

    // Check if already has a pending request
    const existingRequest = community.joinRequests.find(req => 
      req.user.toString() === user._id.toString() && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'You have already requested to join this community' });
    }

    // Add to join requests (all joins now require approval)
    community.joinRequests.push({
      user: req.user.id,
      message: req.body.message || '',
      status: 'pending'
    });

    await community.save();

    // Create notification for community creator/moderators
    const Notification = require('../models/Notification');
    
    // Notify the creator
    await Notification.createNotification({
      recipient: community.creator,
      sender: req.user.id,
      type: 'community_join_request',
      title: 'New Community Join Request',
      message: `${user.name} wants to join your community "${community.name}"`,
      link: `/communities/${community._id}/manage`,
      data: {
        communityId: community._id,
        communityName: community.name,
        requestId: community.joinRequests[community.joinRequests.length - 1]._id,
        userRole: user.role,
        userDepartment: user.department,
        userCourse: user.course,
        userBatch: user.batch
      }
    });

    // Also notify moderators (if any)
    for (const moderator of community.moderators) {
      if (moderator.user.toString() !== community.creator.toString()) {
        await Notification.createNotification({
          recipient: moderator.user,
          sender: req.user.id,
          type: 'community_join_request',
          title: 'New Community Join Request',
          message: `${user.name} wants to join the community "${community.name}"`,
          link: `/communities/${community._id}/manage`,
          data: {
            communityId: community._id,
            communityName: community.name,
            requestId: community.joinRequests[community.joinRequests.length - 1]._id,
            userRole: user.role,
            userDepartment: user.department,
            userCourse: user.course,
            userBatch: user.batch
          }
        });
      }
    }

    res.json({ 
      message: 'Join request sent successfully. Please wait for approval from the community moderators.',
      requiresApproval: true
    });

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

    // Find and update the join request
    const requestIndex = community.joinRequests.findIndex(req => 
      req.user.toString() === userId && req.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    // Update request status and add reviewer info
    community.joinRequests[requestIndex].status = 'approved';
    community.joinRequests[requestIndex].reviewedBy = req.user.id;
    community.joinRequests[requestIndex].reviewedAt = new Date();

    // Add user as member
    console.log('Before adding member - Total members:', community.members.length);
    console.log('User to add:', userId);
    console.log('Is already member?', community.isMember(userId));
    
    community.addMember(userId);
    
    console.log('After adding member - Total members:', community.members.length);
    console.log('Is now member?', community.isMember(userId));

    await community.save();
    
    console.log('After saving - Is member?', community.isMember(userId));

    // Get user info for notification
    const User = require('../models/User');
    const approvedUser = await User.findById(userId);
    const approver = await User.findById(req.user.id);

    // Create notification for the approved user
    const Notification = require('../models/Notification');
    await Notification.createNotification({
      recipient: userId,
      sender: req.user.id,
      type: 'community_join_approved',
      title: 'Community Join Request Approved',
      message: `Your request to join "${community.name}" has been approved by ${approver.name}`,
      link: `/communities/${community._id}`,
      data: {
        communityId: community._id,
        communityName: community.name,
        approvedBy: approver.name,
        approverRole: approver.role
      }
    });

    res.json({ 
      message: 'Join request approved successfully',
      approvedUser: {
        id: approvedUser._id,
        name: approvedUser.name,
        role: approvedUser.role
      }
    });

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
    const { userId, reason } = req.body;
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is moderator
    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({ message: 'Only moderators can reject join requests' });
    }

    // Find and update the join request
    const requestIndex = community.joinRequests.findIndex(req => 
      req.user.toString() === userId && req.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    // Update request status
    community.joinRequests[requestIndex].status = 'rejected';
    community.joinRequests[requestIndex].reviewedBy = req.user.id;
    community.joinRequests[requestIndex].reviewedAt = new Date();

    await community.save();

    // Get user info for notification
    const User = require('../models/User');
    const rejectedUser = await User.findById(userId);
    const rejector = await User.findById(req.user.id);

    // Create notification for the rejected user
    const Notification = require('../models/Notification');
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
        rejectedBy: rejector.name,
        rejectorRole: rejector.role,
        reason: reason || ''
      }
    });

    res.json({ 
      message: 'Join request rejected successfully',
      rejectedUser: {
        id: rejectedUser._id,
        name: rejectedUser.name,
        role: rejectedUser.role
      }
    });

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

// ==================== ADVANCED TEACHER FUNCTIONALITIES ====================

// @route   PUT /api/communities/:id/settings
// @desc    Update community settings (Teachers only)
// @access  Private (Moderators only)
router.put('/:id/settings', [
  auth,
  requireVerified,
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 500 }),
  body('purpose').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({ message: 'Only moderators can update community settings' });
    }

    const { name, description, purpose, isPrivate, requiresApproval, academicSettings, rules } = req.body;

    if (name) community.name = name.trim();
    if (description) community.description = description.trim();
    if (purpose) community.purpose = purpose.trim();
    if (typeof isPrivate === 'boolean') community.isPrivate = isPrivate;
    if (typeof requiresApproval === 'boolean') community.requiresApproval = requiresApproval;
    
    if (academicSettings) {
      community.academicSettings = { ...community.academicSettings, ...academicSettings };
    }

    if (rules) {
      community.rules = rules.map(rule => ({
        title: rule.title?.trim(),
        description: rule.description?.trim(),
        createdAt: rule.createdAt || new Date()
      }));
    }

    await community.save();

    res.json({
      message: 'Community settings updated successfully',
      community
    });

  } catch (error) {
    console.error('Update community settings error:', error);
    res.status(500).json({ message: 'Server error while updating community settings' });
  }
});

// @route   POST /api/communities/:id/members/:userId/promote
// @desc    Promote member to moderator/admin
// @access  Private (Admin only)
router.post('/:id/members/:userId/promote', auth, requireVerified, async (req, res) => {
  try {
    const { role } = req.body; // 'moderator' or 'admin'
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isAdmin(req.user.id)) {
      return res.status(403).json({ message: 'Only admins can promote members' });
    }

    if (!['moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be moderator or admin' });
    }

    const member = community.members.find(m => m.user.toString() === req.params.userId);
    if (!member) {
      return res.status(404).json({ message: 'User is not a member of this community' });
    }

    // Promote member
    community.promoteMember(req.params.userId, role);

    // Add to moderators if promoting to moderator/admin
    if (role === 'moderator' || role === 'admin') {
      const existingMod = community.moderators.find(mod => mod.user.toString() === req.params.userId);
      if (!existingMod) {
        community.moderators.push({
          user: req.params.userId,
          assignedAt: new Date(),
          assignedBy: req.user.id
        });
      }
    }

    // Add moderation log
    community.addModerationLog('member_promoted', req.params.userId, req.user.id, `Promoted to ${role}`, { newRole: role });

    await community.save();

    res.json({ message: `Member promoted to ${role} successfully` });

  } catch (error) {
    console.error('Promote member error:', error);
    res.status(500).json({ message: 'Server error while promoting member' });
  }
});

// @route   POST /api/communities/:id/members/:userId/remove
// @desc    Remove member from community
// @access  Private (Moderators only)
router.post('/:id/members/:userId/remove', auth, requireVerified, async (req, res) => {
  try {
    const { reason } = req.body;
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({ message: 'Only moderators can remove members' });
    }

    // Cannot remove creator
    if (community.creator.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove community creator' });
    }

    // Remove member
    community.removeMember(req.params.userId);
    
    // Remove from moderators if applicable
    community.moderators = community.moderators.filter(mod => mod.user.toString() !== req.params.userId);

    // Add moderation log
    community.addModerationLog('member_removed', req.params.userId, req.user.id, reason || 'No reason provided');

    await community.save();

    res.json({ message: 'Member removed successfully' });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error while removing member' });
  }
});

// @route   POST /api/communities/:id/members/:userId/warn
// @desc    Issue warning to member
// @access  Private (Moderators only)
router.post('/:id/members/:userId/warn', auth, requireVerified, async (req, res) => {
  try {
    const { reason } = req.body;
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({ message: 'Only moderators can issue warnings' });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Warning reason is required' });
    }

    // Issue warning
    community.issueWarning(req.params.userId, reason.trim(), req.user.id);

    // Add moderation log
    community.addModerationLog('warning_issued', req.params.userId, req.user.id, reason.trim());

    await community.save();

    res.json({ message: 'Warning issued successfully' });

  } catch (error) {
    console.error('Issue warning error:', error);
    res.status(500).json({ message: 'Server error while issuing warning' });
  }
});

// @route   POST /api/communities/:id/members/:userId/mute
// @desc    Mute member
// @access  Private (Moderators only)
router.post('/:id/members/:userId/mute', auth, requireVerified, async (req, res) => {
  try {
    const { duration, reason } = req.body; // duration in hours
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({ message: 'Only moderators can mute members' });
    }

    // Mute member
    const muteDuration = duration ? duration * 60 * 60 * 1000 : null; // Convert hours to milliseconds
    community.muteMember(req.params.userId, muteDuration);

    // Add moderation log
    community.addModerationLog('member_muted', req.params.userId, req.user.id, reason || 'No reason provided', { duration });

    await community.save();

    res.json({ message: 'Member muted successfully' });

  } catch (error) {
    console.error('Mute member error:', error);
    res.status(500).json({ message: 'Server error while muting member' });
  }
});

// @route   POST /api/communities/:id/study-materials
// @desc    Upload study material
// @access  Private (Moderators only)
router.post('/:id/study-materials', [
  auth,
  requireVerified,
  uploadStudyMaterial.single('file'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('category').isIn(['lecture', 'assignment', 'reference', 'syllabus', 'notes', 'other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    console.log('Study material upload request:', {
      communityId: req.params.id,
      userId: req.user.id,
      hasFile: !!req.file,
      body: req.body
    });

    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({ message: 'Only moderators can upload study materials' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const { title, description, category, isPublic = true } = req.body;

    console.log('Uploading to Cloudinary:', {
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    // Upload to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'collegeconnect/study-materials',
      resource_type: 'auto',
      public_id: `${Date.now()}_${req.file.originalname.replace(/\.[^/.]+$/, '')}`
    });

    console.log('Cloudinary upload successful:', result.secure_url);

    // Determine file type
    const fileType = req.file.mimetype.includes('pdf') ? 'pdf' :
                    req.file.mimetype.includes('presentation') || req.file.mimetype.includes('powerpoint') ? 'ppt' :
                    req.file.mimetype.includes('document') || req.file.mimetype.includes('word') ? 'doc' :
                    req.file.mimetype.includes('sheet') || req.file.mimetype.includes('excel') ? 'xls' :
                    req.file.mimetype.includes('image') ? 'image' :
                    req.file.mimetype.includes('video') ? 'video' : 'other';

    // Add study material
    const studyMaterial = {
      title: title.trim(),
      description: description?.trim() || '',
      fileUrl: result.secure_url,
      fileType,
      uploadedBy: req.user.id,
      category,
      isPublic: isPublic === 'true' || isPublic === true
    };

    community.studyMaterials.push(studyMaterial);
    community.stats.totalMaterials = community.studyMaterials.length;

    await community.save();

    console.log('Study material saved successfully');

    res.status(201).json({
      message: 'Study material uploaded successfully',
      material: studyMaterial
    });

  } catch (error) {
    console.error('Upload study material error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error while uploading study material',
      error: error.message 
    });
  }
});

// @route   GET /api/communities/:id/study-materials
// @desc    Get study materials
// @access  Private (Members only)
router.get('/:id/study-materials', auth, requireVerified, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('studyMaterials.uploadedBy', 'name role');
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isMember(req.user.id)) {
      return res.status(403).json({ message: 'Only members can access study materials' });
    }

    const { category } = req.query;
    let materials = community.studyMaterials;

    if (category && category !== 'all') {
      materials = materials.filter(material => material.category === category);
    }

    // Filter by visibility
    if (!community.isModerator(req.user.id)) {
      materials = materials.filter(material => material.isPublic);
    }

    res.json({ materials });

  } catch (error) {
    console.error('Get study materials error:', error);
    res.status(500).json({ message: 'Server error while fetching study materials' });
  }
});

// @route   POST /api/communities/:id/assignments
// @desc    Create assignment
// @access  Private (Moderators only)
router.post('/:id/assignments', [
  auth,
  requireVerified,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
], async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({ message: 'Only moderators can create assignments' });
    }

    const { title, description, dueDate, attachments = [] } = req.body;

    const assignment = {
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate),
      attachments,
      createdBy: req.user.id,
      submissions: []
    };

    community.assignments.push(assignment);
    community.stats.totalAssignments = community.assignments.length;

    await community.save();

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });

  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error while creating assignment' });
  }
});

// @route   GET /api/communities/:id/assignments
// @desc    Get assignments
// @access  Private (Members only)
router.get('/:id/assignments', auth, requireVerified, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('assignments.createdBy', 'name role')
      .populate('assignments.submissions.student', 'name role');
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isMember(req.user.id)) {
      return res.status(403).json({ message: 'Only members can access assignments' });
    }

    res.json({ assignments: community.assignments });

  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error while fetching assignments' });
  }
});

// @route   POST /api/communities/:id/events
// @desc    Create event
// @access  Private (Moderators only)
router.post('/:id/events', [
  auth,
  requireVerified,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('type').isIn(['lecture', 'seminar', 'workshop', 'exam', 'meeting', 'other']).withMessage('Invalid event type')
], async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({ message: 'Only moderators can create events' });
    }

    const { title, description, date, time, location, type } = req.body;

    const event = {
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      time: time || '',
      location: location || '',
      type,
      createdBy: req.user.id,
      attendees: []
    };

    community.events.push(event);

    await community.save();

    res.status(201).json({
      message: 'Event created successfully',
      event
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error while creating event' });
  }
});

// @route   GET /api/communities/:id/analytics
// @desc    Get community analytics
// @access  Private (Moderators only)
router.get('/:id/analytics', auth, requireVerified, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('members.user', 'name role department course batch lastLogin');
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({ message: 'Only moderators can view analytics' });
    }

    // Calculate analytics
    const totalMembers = community.members.length;
    const activeMembers = community.members.filter(member => {
      const lastActivity = new Date(member.lastActivity);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastActivity > weekAgo;
    }).length;

    const membersByRole = community.members.reduce((acc, member) => {
      const role = member.user.role || 'student';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    const topContributors = community.members
      .sort((a, b) => (b.postsCount + b.commentsCount) - (a.postsCount + a.commentsCount))
      .slice(0, 10);

    const analytics = {
      totalMembers,
      activeMembers,
      membersByRole,
      topContributors,
      totalPosts: community.stats.totalPosts,
      totalMaterials: community.stats.totalMaterials,
      totalAssignments: community.stats.totalAssignments,
      joinRequests: community.joinRequests.length,
      moderationLogs: community.moderationLogs.slice(-20) // Last 20 actions
    };

    res.json({ analytics });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
});

// @route   GET /api/communities/:id/messages
// @desc    Get community messages
// @access  Private (Members only)
router.get('/:id/messages', auth, requireVerified, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.canAccessContent(req.user.id)) {
      return res.status(403).json({ message: 'You do not have access to this community' });
    }

    // Get messages using the Message model
    const messages = await Message.getCommunityMessages(req.params.id, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // If no messages exist, create a welcome message
    if (messages.length === 0) {
      const creator = await User.findById(community.creator);
      const welcomeMessage = new Message({
        community: community._id,
        sender: community.creator,
        content: `Welcome to ${community.name}! 📚 This is where we'll share updates, materials, and discussions.`,
        type: 'announcement',
        isPinned: true,
        pinnedBy: community.creator,
        pinnedAt: new Date()
      });
      
      await welcomeMessage.save();
      await welcomeMessage.populate('sender', 'name role profileImage department');
      
      return res.json({
        messages: [welcomeMessage],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          hasMore: false
        }
      });
    }

    const totalMessages = await Message.countDocuments({
      community: req.params.id,
      isDeleted: false
    });

    res.json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        hasMore: (page * limit) < totalMessages
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
});

// @route   POST /api/communities/:id/messages
// @desc    Send message to community
// @access  Private (Members only, with posting permissions)
router.post('/:id/messages', [
  auth,
  requireVerified,
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Message content must be between 1 and 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { content, type = 'text' } = req.body;
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.canAccessContent(req.user.id)) {
      return res.status(403).json({ message: 'You do not have access to this community' });
    }

    // Check if user can post
    const canPost = community.isModerator(req.user.id) || 
                   (community.academicSettings?.allowStudentPosts && community.isMember(req.user.id));

    if (!canPost) {
      return res.status(403).json({ message: 'You do not have permission to post in this community' });
    }

    // Create new message
    const message = new Message({
      community: req.params.id,
      sender: req.user.id,
      content: content.trim(),
      type
    });

    await message.save();
    await message.populate('sender', 'name role profileImage department');

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
});

// @route   POST /api/communities/:id/messages/:messageId/react
// @desc    Add reaction to message
// @access  Private (Members only)
router.post('/:id/messages/:messageId/react', auth, requireVerified, async (req, res) => {
  try {
    const { type = 'like' } = req.body;
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.canAccessContent(req.user.id)) {
      return res.status(403).json({ message: 'You do not have access to this community' });
    }

    const message = await Message.findOne({
      _id: req.params.messageId,
      community: req.params.id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.addReaction(req.user.id, type);

    res.json({ message: 'Reaction added successfully' });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error while adding reaction' });
  }
});

// @route   DELETE /api/communities/:id/messages/:messageId/react
// @desc    Remove reaction from message
// @access  Private (Members only)
router.delete('/:id/messages/:messageId/react', auth, requireVerified, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.canAccessContent(req.user.id)) {
      return res.status(403).json({ message: 'You do not have access to this community' });
    }

    const message = await Message.findOne({
      _id: req.params.messageId,
      community: req.params.id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.removeReaction(req.user.id);

    res.json({ message: 'Reaction removed successfully' });

  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ message: 'Server error while removing reaction' });
  }
});

// @route   POST /api/communities/:id/messages/:messageId/pin
// @desc    Pin/unpin message
// @access  Private (Moderators only)
router.post('/:id/messages/:messageId/pin', auth, requireVerified, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isModerator(req.user.id)) {
      return res.status(403).json({ message: 'Only moderators can pin messages' });
    }

    const message = await Message.findOne({
      _id: req.params.messageId,
      community: req.params.id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.isPinned) {
      await message.unpinMessage();
      res.json({ message: 'Message unpinned successfully' });
    } else {
      await message.pinMessage(req.user.id);
      res.json({ message: 'Message pinned successfully' });
    }

  } catch (error) {
    console.error('Pin message error:', error);
    res.status(500).json({ message: 'Server error while pinning message' });
  }
});

// @route   GET /api/communities/:id/debug-access
// @desc    Debug community access (temporary)
// @access  Private
router.get('/:id/debug-access', auth, requireVerified, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('members.user', 'name role department course batch')
      .populate('joinRequests.user', 'name role department course batch');
    
    if (!community || !community.isActive) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const user = await User.findById(req.user.id);
    const isMember = community.isMember(req.user.id);
    const isModerator = community.isModerator(req.user.id);
    const canAccessContent = community.canAccessContent(req.user.id);
    
    // Find user's membership record
    const membershipRecord = community.members.find(m => m.user._id.toString() === req.user.id);
    
    // Find user's join request record
    const joinRequestRecord = community.joinRequests.find(r => r.user._id.toString() === req.user.id);

    res.json({
      debug: {
        userId: req.user.id,
        userName: user.name,
        communityId: community._id,
        communityName: community.name,
        isMember,
        isModerator,
        canAccessContent,
        membershipRecord,
        joinRequestRecord,
        totalMembers: community.members.length,
        allMembers: community.members.map(m => ({
          id: m.user._id,
          name: m.user.name,
          role: m.role,
          joinedAt: m.joinedAt
        }))
      }
    });

  } catch (error) {
    console.error('Debug access error:', error);
    res.status(500).json({ message: 'Server error while debugging access' });
  }
});

module.exports = router;