const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { auth, requireVerified } = require('../middleware/auth');

// @route   GET /api/search/users
// @desc    Search for users
// @access  Private
router.get('/users', auth, requireVerified, async (req, res) => {
  try {
    const { q, role, department, course, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const skip = (page - 1) * limit;
    
    // Build search filter
    const filter = {
      verificationStatus: 'verified',
      isActive: { $ne: false },
      _id: { $ne: req.user.id } // Exclude current user
    };

    // Text search on name and email
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { department: { $regex: q, $options: 'i' } },
      { currentCompany: { $regex: q, $options: 'i' } },
      { jobTitle: { $regex: q, $options: 'i' } }
    ];

    // Additional filters
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (course) filter.course = course;

    const users = await User.find(filter)
      .select('name email role department course batch profileImage currentCompany jobTitle bio verificationStatus')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        hasMore: skip + users.length < total
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
});

// @route   GET /api/search/posts
// @desc    Search for posts
// @access  Private
router.get('/posts', auth, requireVerified, async (req, res) => {
  try {
    const { q, type, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const skip = (page - 1) * limit;
    
    // Build search filter
    const filter = {
      isActive: true,
      content: { $regex: q, $options: 'i' }
    };

    if (type && type !== 'all') {
      filter.postType = type;
    }

    const posts = await Post.find(filter)
      .populate('author', 'name role department course batch profileImage currentCompany jobTitle')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter posts based on user's eligibility
    const user = await User.findById(req.user.id);
    const filteredPosts = posts.filter(post => post.canUserView(user));

    const total = await Post.countDocuments(filter);

    res.json({
      posts: filteredPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        hasMore: skip + filteredPosts.length < total
      }
    });

  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ message: 'Server error while searching posts' });
  }
});

// @route   GET /api/search/all
// @desc    Search for users and posts
// @access  Private
router.get('/all', auth, requireVerified, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    // Search users (limit to 5)
    const userFilter = {
      verificationStatus: 'verified',
      _id: { $ne: req.user.id },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } }
      ]
    };

    const users = await User.find(userFilter)
      .select('name email role department course batch profileImage currentCompany jobTitle')
      .limit(5);

    // Search posts (limit to 5)
    const postFilter = {
      isActive: true,
      content: { $regex: q, $options: 'i' }
    };

    const posts = await Post.find(postFilter)
      .populate('author', 'name role department profileImage')
      .sort({ createdAt: -1 })
      .limit(5);

    // Filter posts based on user's eligibility
    const user = await User.findById(req.user.id);
    const filteredPosts = posts.filter(post => post.canUserView(user));

    res.json({
      users,
      posts: filteredPosts,
      totalUsers: users.length,
      totalPosts: filteredPosts.length
    });

  } catch (error) {
    console.error('Search all error:', error);
    res.status(500).json({ message: 'Server error while searching' });
  }
});

module.exports = router;
