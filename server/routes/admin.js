const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Post = require('../models/Post');
const Community = require('../models/Community');
const { auth, requireVerified, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email service function
const sendVerificationEmail = async (user, status, reason = null) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 Email credentials not configured, logging email content instead:');
      console.log(`To: ${user.email}`);
      console.log(`Subject: ${status === 'approved' ? '🎉 Welcome to CampusConnect - Account Verified!' : '❌ CampusConnect Account Verification Update'}`);
      return true;
    }

    const transporter = createEmailTransporter();
    
    const emailContent = {
      from: {
        name: 'CampusConnect Admin',
        address: process.env.EMAIL_USER
      },
      to: user.email,
      subject: status === 'approved' 
        ? '🎉 Welcome to CampusConnect - Account Verified!' 
        : '❌ CampusConnect Account Verification Update',
      html: status === 'approved' 
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">🎉 Welcome to CampusConnect!</h1>
              </div>
              
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${user.name},</p>
              
              <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">
                Great news! Your CampusConnect account has been verified and approved by our admin team.
              </p>
              
              <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">📋 Account Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 5px 0; color: #6b7280;"><strong>Name:</strong></td><td style="padding: 5px 0; color: #374151;">${user.name}</td></tr>
                  <tr><td style="padding: 5px 0; color: #6b7280;"><strong>Email:</strong></td><td style="padding: 5px 0; color: #374151;">${user.email}</td></tr>
                  <tr><td style="padding: 5px 0; color: #6b7280;"><strong>Role:</strong></td><td style="padding: 5px 0; color: #374151;">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td></tr>
                  <tr><td style="padding: 5px 0; color: #6b7280;"><strong>Department:</strong></td><td style="padding: 5px 0; color: #374151;">${user.department}</td></tr>
                  <tr><td style="padding: 5px 0; color: #6b7280;"><strong>Course:</strong></td><td style="padding: 5px 0; color: #374151;">${user.course}</td></tr>
                  <tr><td style="padding: 5px 0; color: #6b7280;"><strong>Batch:</strong></td><td style="padding: 5px 0; color: #374151;">${user.batch}</td></tr>
                </table>
              </div>
              
              <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
                You can now login to your account and start connecting with your college community!
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" 
                   style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                  🚀 Login to CampusConnect
                </a>
              </div>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #6b7280; margin: 0;">Best regards,<br><strong>CampusConnect Admin Team</strong></p>
                <p style="color: #9ca3af; font-size: 14px; margin-top: 10px;">
                  This email was sent from ${process.env.EMAIL_USER}
                </p>
              </div>
            </div>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #dc2626; margin: 0; font-size: 28px;">❌ Account Verification Update</h1>
              </div>
              
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${user.name},</p>
              
              <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">
                We regret to inform you that your CampusConnect account verification has been rejected.
              </p>
              
              ${reason ? `
                <div style="background: #fef2f2; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #dc2626;">
                  <h3 style="color: #dc2626; margin-top: 0; font-size: 18px;">📋 Reason for Rejection:</h3>
                  <p style="color: #374151; margin: 0; font-size: 16px;">${reason}</p>
                </div>
              ` : ''}
              
              <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
                If you believe this is an error or would like to reapply with correct information, please contact our support team.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${process.env.EMAIL_USER}" 
                   style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                  📧 Contact Support
                </a>
              </div>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #6b7280; margin: 0;">Best regards,<br><strong>CampusConnect Admin Team</strong></p>
                <p style="color: #9ca3af; font-size: 14px; margin-top: 10px;">
                  This email was sent from ${process.env.EMAIL_USER}
                </p>
              </div>
            </div>
          </div>
        `
    };

    // Send email
    const info = await transporter.sendMail(emailContent);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log('📧 Email sent to:', user.email);
    
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    
    // Fallback to console logging if email fails
    console.log('📧 Email would be sent to:', user.email);
    console.log('📧 Subject:', status === 'approved' ? 'Account Verified' : 'Account Verification Rejected');
    
    return false;
  }
};

// @route   POST /api/admin/auth/login
// @desc    Admin login (separate from regular login)
// @access  Public
router.post('/auth/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Check if user exists and is admin
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Check password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            verificationStatus: user.verificationStatus
          }
        });
      }
    );

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// All other admin routes require admin role
router.use(auth, requireVerified, requireRole(['admin']));

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verificationStatus: 'verified' });
    const pendingUsers = await User.countDocuments({ verificationStatus: 'pending_verification' });
    const blockedUsers = await User.countDocuments({ verificationStatus: 'blocked' });

    // Role distribution
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Department distribution
    const departmentStats = await User.aggregate([
      { $match: { verificationStatus: 'verified' } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    // Post statistics
    const totalPosts = await Post.countDocuments({ isActive: true });
    const reportedPosts = await Post.countDocuments({ isReported: true, isActive: true });
    const postsByType = await Post.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$postType', count: { $sum: 1 } } }
    ]);

    // Community statistics
    const totalCommunities = await Community.countDocuments({ isActive: true });
    const communitiesByType = await Community.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    const recentPosts = await Post.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo },
      isActive: true 
    });

    res.json({
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        pending: pendingUsers,
        blocked: blockedUsers,
        recent: recentUsers,
        byRole: roleStats,
        byDepartment: departmentStats
      },
      posts: {
        total: totalPosts,
        reported: reportedPosts,
        recent: recentPosts,
        byType: postsByType
      },
      communities: {
        total: totalCommunities,
        byType: communitiesByType
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

// @route   GET /api/admin/users/pending
// @desc    Get users pending verification
// @access  Private (Admin only)
router.get('/users/pending', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let filter = { verificationStatus: 'pending_verification' };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { collegeId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: skip + users.length < totalCount
      }
    });

  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ message: 'Server error while fetching pending users' });
  }
});

// @route   POST /api/admin/users/:id/verify
// @desc    Verify a user and send email notification
// @access  Private (Admin only)
router.post('/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verificationStatus === 'verified') {
      return res.status(400).json({ message: 'User is already verified' });
    }

    user.verificationStatus = 'verified';
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, 'approved');

    res.json({
      message: 'User verified successfully and email sent',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verificationStatus: user.verificationStatus
      }
    });

  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Server error while verifying user' });
  }
});

// @route   POST /api/admin/users/:id/block
// @desc    Block a user and send notification email
// @access  Private (Admin only)
router.post('/users/:id/block', [
  body('reason').optional().trim().isLength({ min: 1 }).withMessage('Block reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block another admin' });
    }

    user.verificationStatus = 'blocked';
    // Store block reason in user document
    user.blockReason = reason || 'Account verification rejected by admin';
    await user.save();

    // Send rejection email
    await sendVerificationEmail(user, 'rejected', reason);

    res.json({
      message: 'User blocked successfully and notification email sent',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verificationStatus: user.verificationStatus
      }
    });

  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error while blocking user' });
  }
});

// @route   POST /api/admin/users/:id/unblock
// @desc    Unblock a user
// @access  Private (Admin only)
router.post('/users/:id/unblock', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verificationStatus !== 'blocked') {
      return res.status(400).json({ message: 'User is not blocked' });
    }

    user.verificationStatus = 'verified';
    await user.save();

    res.json({
      message: 'User unblocked successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verificationStatus: user.verificationStatus
      }
    });

  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: 'Server error while unblocking user' });
  }
});

// @route   GET /api/admin/posts/reported
// @desc    Get reported posts
// @access  Private (Admin only)
router.get('/posts/reported', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ 
      isReported: true, 
      isActive: true 
    })
    .populate('author', 'name role department course batch profileImage')
    .populate('reports.reportedBy', 'name role')
    .sort({ 'reports.0.createdAt': -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalCount = await Post.countDocuments({ 
      isReported: true, 
      isActive: true 
    });

    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: skip + posts.length < totalCount
      }
    });

  } catch (error) {
    console.error('Get reported posts error:', error);
    res.status(500).json({ message: 'Server error while fetching reported posts' });
  }
});

// @route   POST /api/admin/posts/:id/approve
// @desc    Approve a reported post (remove reports)
// @access  Private (Admin only)
router.post('/posts/:id/approve', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isReported = false;
    post.reports = [];
    await post.save();

    res.json({ message: 'Post approved successfully' });

  } catch (error) {
    console.error('Approve post error:', error);
    res.status(500).json({ message: 'Server error while approving post' });
  }
});

// @route   DELETE /api/admin/posts/:id
// @desc    Delete a post
// @access  Private (Admin only)
router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isActive = false;
    await post.save();

    // TODO: Notify post author about deletion

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      role = 'all', 
      department = 'all',
      verificationStatus = 'all'
    } = req.query;
    
    const skip = (page - 1) * limit;

    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { collegeId: { $regex: search, $options: 'i' } }
      ];
    }

    if (role !== 'all') filter.role = role;
    if (department !== 'all') filter.department = department;
    if (verificationStatus !== 'all') filter.verificationStatus = verificationStatus;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: skip + users.length < totalCount
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', [
  body('role').isIn(['student', 'alumni', 'teacher', 'principal']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot change admin role' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error while updating user role' });
  }
});

module.exports = router;