const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const { auth, requireVerified } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile/:id
// @desc    Get user profile
// @access  Private
router.get('/profile/:id', auth, requireVerified, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -contactNumber');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check privacy settings
    const requestingUser = await User.findById(req.user.id);
    
    if (user.profileVisibility === 'private' && user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'This profile is private' });
    }

    if (user.profileVisibility === 'college_only') {
      // Allow if same college (verified users only)
      if (requestingUser.verificationStatus !== 'verified') {
        return res.status(403).json({ message: 'Profile access restricted to verified college members' });
      }
    }

    // Get user's posts count
    const postCount = await Post.countDocuments({ 
      author: user._id, 
      isActive: true 
    });

    // Include contact number only if user allows it or it's their own profile
    const profileData = {
      ...user.toObject(),
      postCount
    };

    if (user.showContactNumber || user._id.toString() === req.user.id) {
      const fullUser = await User.findById(req.params.id).select('-password');
      profileData.contactNumber = fullUser.contactNumber;
    }

    res.json({ user: profileData });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  requireVerified,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('currentCompany').optional().trim().isLength({ max: 100 }).withMessage('Company name too long'),
  body('jobTitle').optional().trim().isLength({ max: 100 }).withMessage('Job title too long'),
  body('profileVisibility').optional().isIn(['public', 'college_only', 'private']).withMessage('Invalid profile visibility'),
  body('showContactNumber').optional().isBoolean().withMessage('Show contact number must be boolean')
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
      bio,
      currentCompany,
      jobTitle,
      graduationYear,
      profileVisibility,
      showContactNumber
    } = req.body;

    const updateFields = {};
    
    if (name) updateFields.name = name.trim();
    if (bio !== undefined) updateFields.bio = bio.trim();
    if (currentCompany !== undefined) updateFields.currentCompany = currentCompany.trim();
    if (jobTitle !== undefined) updateFields.jobTitle = jobTitle.trim();
    if (graduationYear) updateFields.graduationYear = graduationYear;
    if (profileVisibility) updateFields.profileVisibility = profileVisibility;
    if (showContactNumber !== undefined) updateFields.showContactNumber = showContactNumber;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// @route   GET /api/users/posts/:id
// @desc    Get user's posts
// @access  Private
router.get('/posts/:id', auth, requireVerified, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can view posts
    const requestingUser = await User.findById(req.user.id);
    
    if (user.profileVisibility === 'private' && user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'This profile is private' });
    }

    const posts = await Post.find({ 
      author: req.params.id, 
      isActive: true 
    })
    .populate('author', 'name role department course batch profileImage currentCompany jobTitle')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Filter posts based on requesting user's eligibility
    const filteredPosts = posts.filter(post => post.canUserView(requestingUser));

    res.json({
      posts: filteredPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredPosts.length / limit),
        hasMore: filteredPosts.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error while fetching user posts' });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', auth, requireVerified, async (req, res) => {
  try {
    const { q, department, course, batch, role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    // Build search filter
    let filter = {
      verificationStatus: 'verified',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    };

    // Add additional filters
    if (department && department !== 'all') filter.department = department;
    if (course && course !== 'all') filter.course = course;
    if (batch && batch !== 'all') filter.batch = batch;
    if (role && role !== 'all') filter.role = role;

    const users = await User.find(filter)
      .select('name email role department course batch profileImage currentCompany jobTitle profileVisibility')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    // Filter based on profile visibility
    const filteredUsers = users.filter(user => {
      if (user.profileVisibility === 'public') return true;
      if (user.profileVisibility === 'college_only') return true; // All verified users are college members
      return false; // Private profiles not shown in search
    });

    res.json({
      users: filteredUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredUsers.length / limit),
        hasMore: filteredUsers.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
});

// @route   GET /api/users/suggestions
// @desc    Get user suggestions (same department, course, batch)
// @access  Private
router.get('/suggestions', auth, requireVerified, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const currentUser = await User.findById(req.user.id);
    
    // Find users with similar profile
    const suggestions = await User.find({
      _id: { $ne: req.user.id },
      verificationStatus: 'verified',
      profileVisibility: { $in: ['public', 'college_only'] },
      $or: [
        { department: currentUser.department },
        { course: currentUser.course },
        { batch: currentUser.batch }
      ]
    })
    .select('name role department course batch profileImage currentCompany jobTitle')
    .limit(parseInt(limit))
    .sort({ lastActive: -1 });

    res.json({ users: suggestions });

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Server error while fetching suggestions' });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload profile picture
// @access  Private
router.post('/upload-avatar', auth, requireVerified, async (req, res) => {
  try {
    // TODO: Implement file upload with Cloudinary
    // For now, just return success message
    
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile picture updated successfully',
      profileImage: user.profileImage
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Server error while uploading avatar' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, requireVerified, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get post count
    const postCount = await Post.countDocuments({ 
      author: userId, 
      isActive: true 
    });

    // Get total likes received
    const posts = await Post.find({ author: userId, isActive: true });
    const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);

    // Get total comments received
    const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);

    // TODO: Get connections count (implement connections feature)
    const connectionsCount = 0;

    // TODO: Get communities count
    const communitiesCount = 0;

    res.json({
      stats: {
        posts: postCount,
        likes: totalLikes,
        comments: totalComments,
        connections: connectionsCount,
        communities: communitiesCount
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error while fetching stats' });
  }
});

module.exports = router;