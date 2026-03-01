const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const Community = require('../models/Community');
const { 
  auth, 
  requireVerified, 
  canPostAnnouncement, 
  canPostOpportunity 
} = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// @route   POST /api/posts/upload-media
// @desc    Upload media files for posts
// @access  Private
router.post('/upload-media', auth, requireVerified, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Uploading media to Cloudinary...');
    
    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Determine resource type
    const resourceType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'collegeconnect/posts',
      resource_type: resourceType,
      transformation: resourceType === 'image' ? [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
      ] : [
        { width: 1280, height: 720, crop: 'limit', quality: 'auto' }
      ]
    });

    console.log('Media uploaded successfully:', result.secure_url);

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      type: resourceType
    });

  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ message: 'Error uploading media' });
  }
});

// @route   GET /api/posts
// @desc    Get posts for user's feed
// @access  Private
router.get('/', auth, requireVerified, async (req, res) => {
  try {
    const { page = 1, limit = 10, type = 'all' } = req.query;
    const skip = (page - 1) * limit;

    console.log(`Fetching posts - Page: ${page}, Limit: ${limit}, Type: ${type}, User: ${req.user.id}`);

    // Build filter based on user's profile and post type
    let filter = { 
      isActive: true,
      author: { $ne: req.user.id } // Exclude user's own posts
    };
    
    if (type !== 'all') {
      filter.postType = type;
    }

    // Get posts that user can view based on targeting
    const posts = await Post.find(filter)
      .populate('author', 'name role department course batch profileImage currentCompany jobTitle')
      .populate('community', 'name type')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`Found ${posts.length} posts from database`);

    // Filter posts based on user's eligibility and add isLiked flag
    const user = await User.findById(req.user.id);
    const filteredPosts = posts.filter(post => post.canUserView(user)).map(post => {
      const postObj = post.toObject({ virtuals: true });
      // Add isLiked flag
      postObj.isLiked = post.likes.some(like => like.user.toString() === req.user.id);
      return postObj;
    });

    console.log(`After filtering: ${filteredPosts.length} posts visible to user`);

    res.json({
      posts: filteredPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredPosts.length / limit),
        hasMore: filteredPosts.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error while fetching posts' });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', [
  auth,
  requireVerified,
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('postType').isIn(['community_post', 'blog', 'announcement', 'opportunity', 'reel', 'story', 'event', 'poll']).withMessage('Invalid post type')
], async (req, res) => {
  try {
    console.log('=== Create Post Request ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user.id, req.user.role);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      content,
      postType,
      isImportant = false,
      targetAudience = {},
      community,
      opportunityDetails,
      eventDetails,
      pollDetails,
      media = []
    } = req.body;

    // Check permissions for specific post types
    if (postType === 'announcement' || postType === 'event' || postType === 'poll' || isImportant) {
      const allowedRoles = ['teacher', 'principal', 'admin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Only teachers, principals, and admins can post announcements, events, polls, or mark posts as important' 
        });
      }
    }

    if (postType === 'opportunity') {
      const allowedRoles = ['alumni', 'teacher', 'principal', 'admin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Only alumni, teachers, principals, and admins can post opportunities' 
        });
      }
    }

    // Validate community if specified
    if (community) {
      const communityDoc = await Community.findById(community);
      if (!communityDoc) {
        return res.status(404).json({ message: 'Community not found' });
      }
      
      if (!communityDoc.isMember(req.user.id)) {
        return res.status(403).json({ message: 'You must be a member of this community to post' });
      }
    }

    // Create post
    const postData = {
      author: req.user.id,
      content: content.trim(),
      postType,
      isImportant,
      targetAudience: {
        departments: targetAudience.departments || [],
        courses: targetAudience.courses || [],
        batches: targetAudience.batches || [],
        roles: targetAudience.roles || []
      },
      community,
      media,
      expiresAt: postType === 'story' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined // 24 hours for stories
    };

    // Add type-specific details
    if (postType === 'opportunity' && opportunityDetails) {
      postData.opportunityDetails = opportunityDetails;
    }
    
    if (postType === 'event' && eventDetails) {
      postData.eventDetails = eventDetails;
    }
    
    if (postType === 'poll' && pollDetails) {
      // Transform poll options from array of strings to array of objects
      postData.pollDetails = {
        question: pollDetails.question,
        options: pollDetails.options.map(opt => ({
          text: typeof opt === 'string' ? opt : opt.text,
          votes: []
        })),
        duration: pollDetails.duration || 7,
        endsAt: new Date(Date.now() + (pollDetails.duration || 7) * 24 * 60 * 60 * 1000)
      };
    }

    const post = new Post(postData);
    await post.save();

    // Update community stats if posted in a community
    if (community) {
      await Community.findByIdAndUpdate(community, {
        $inc: { 'stats.totalPosts': 1 },
        'stats.lastActivity': new Date()
      });
    }

    // Populate author info for response
    await post.populate('author', 'name role department course batch profileImage currentCompany jobTitle');
    
    res.status(201).json({
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error while creating post' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get a specific post
// @access  Private
router.get('/:id', auth, requireVerified, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name role department course batch profileImage currentCompany jobTitle')
      .populate('community', 'name type')
      .populate('comments.user', 'name role profileImage');

    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user can view this post
    const user = await User.findById(req.user.id);
    if (!post.canUserView(user)) {
      return res.status(403).json({ message: 'You do not have permission to view this post' });
    }

    // Add isLiked flag
    const postObj = post.toObject({ virtuals: true });
    postObj.isLiked = post.likes.some(like => like.user.toString() === req.user.id);

    res.json({ post: postObj });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error while fetching post' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', auth, requireVerified, async (req, res) => {
  try {
    console.log('Like request:', { postId: req.params.id, userId: req.user.id });
    
    const post = await Post.findById(req.params.id).populate('author', 'name');
    
    if (!post || !post.isActive) {
      console.log('Post not found or inactive');
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user can view this post
    const user = await User.findById(req.user.id);
    if (!post.canUserView(user)) {
      console.log('User cannot view post');
      return res.status(403).json({ message: 'You do not have permission to interact with this post' });
    }

    // Check if already liked
    const likeIndex = post.likes.findIndex(like => like.user.toString() === req.user.id);
    const isLiking = likeIndex === -1;

    console.log('Like status:', { likeIndex, isLiking, currentLikes: post.likes.length });

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      console.log('Unliked post');
    } else {
      // Like
      post.likes.push({ user: req.user.id });
      console.log('Liked post');
      
      // Send notification to post author (only when liking, not unliking)
      if (post.author._id.toString() !== req.user.id) {
        const Notification = require('../models/Notification');
        await Notification.createNotification({
          recipient: post.author._id,
          sender: req.user.id,
          type: 'post_like',
          title: 'New Like on Your Post',
          message: `${user.name} liked your post`,
          link: `/posts/${post._id}`,
          data: {
            postId: post._id,
            postContent: post.content.substring(0, 100)
          }
        });
        console.log('Notification sent to post author');
      }
    }

    await post.save();
    console.log('Post saved, new like count:', post.likes.length);

    res.json({
      message: isLiking ? 'Post liked' : 'Post unliked',
      likeCount: post.likes.length,
      isLiked: isLiking
    });

  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error while liking post' });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comment', [
  auth,
  requireVerified,
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { content } = req.body;
    const post = await Post.findById(req.params.id).populate('author', 'name');
    
    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user can view this post
    const user = await User.findById(req.user.id);
    if (!post.canUserView(user)) {
      return res.status(403).json({ message: 'You do not have permission to comment on this post' });
    }

    // Add comment
    const newComment = {
      user: req.user.id,
      content: content.trim()
    };

    post.comments.push(newComment);
    await post.save();

    // Send notification to post author (don't notify if commenting on own post)
    if (post.author._id.toString() !== req.user.id) {
      const Notification = require('../models/Notification');
      await Notification.createNotification({
        recipient: post.author._id,
        sender: req.user.id,
        type: 'post_comment',
        title: 'New Comment on Your Post',
        message: `${user.name} commented: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        link: `/posts/${post._id}`,
        data: {
          postId: post._id,
          commentContent: content,
          postContent: post.content.substring(0, 100)
        }
      });
    }

    // Populate the new comment for response
    await post.populate('comments.user', 'name role profileImage');
    const addedComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: addedComment,
      commentCount: post.comments.length
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, requireVerified, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post or is admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
});

// @route   POST /api/posts/:id/report
// @desc    Report a post
// @access  Private
router.post('/:id/report', [
  auth,
  requireVerified,
  body('reason').trim().isLength({ min: 1 }).withMessage('Report reason is required')
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
    const post = await Post.findById(req.params.id);
    
    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already reported by this user
    const existingReport = post.reports.find(report => 
      report.reportedBy.toString() === req.user.id
    );

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    // Add report
    post.reports.push({
      reportedBy: req.user.id,
      reason: reason.trim()
    });

    post.isReported = true;
    await post.save();

    res.json({ message: 'Post reported successfully' });

  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({ message: 'Server error while reporting post' });
  }
});

// @route   POST /api/posts/:id/vote
// @desc    Vote on a poll post
// @access  Private
router.post('/:id/vote', auth, requireVerified, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    
    if (typeof optionIndex !== 'number' || optionIndex < 0) {
      return res.status(400).json({ message: 'Invalid option index' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.postType !== 'poll' || !post.pollDetails) {
      return res.status(400).json({ message: 'This is not a poll post' });
    }

    if (optionIndex >= post.pollDetails.options.length) {
      return res.status(400).json({ message: 'Invalid option index' });
    }

    // Check if poll has expired
    if (post.pollDetails.endsAt && new Date() > post.pollDetails.endsAt) {
      return res.status(400).json({ message: 'This poll has expired' });
    }

    // Check if user has already voted
    const hasVoted = post.pollDetails.options.some(option => 
      option.votes.some(vote => vote.user.toString() === req.user.id)
    );

    if (hasVoted) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }

    // Add the vote
    post.pollDetails.options[optionIndex].votes.push({
      user: req.user.id,
      votedAt: new Date()
    });

    await post.save();

    // Populate the post with author details for response
    await post.populate('author', 'name role department profileImage');

    res.json({
      message: 'Vote recorded successfully',
      post
    });

  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Server error while voting' });
  }
});

module.exports = router;