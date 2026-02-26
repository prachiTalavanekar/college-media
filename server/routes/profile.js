const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/profile/user/:userId
// @desc    Get public user profile by ID
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check privacy settings
    if (user.profileVisibility === 'private' && user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'This profile is private' });
    }

    // Track profile view (only if viewing someone else's profile)
    if (user._id.toString() !== req.user.id) {
      try {
        // Check if this viewer already viewed this profile recently (within last 24 hours)
        const recentView = user.profileViews && user.profileViews.find(view => 
          view.viewer && 
          view.viewer.toString() === req.user.id && 
          (Date.now() - new Date(view.viewedAt).getTime()) < 24 * 60 * 60 * 1000
        );

        // Only add new view if no recent view exists
        if (!recentView) {
          if (!user.profileViews) {
            user.profileViews = [];
          }
          user.profileViews.push({
            viewer: req.user.id,
            viewedAt: new Date()
          });
          await user.save();
        }
      } catch (viewError) {
        console.error('Error tracking profile view:', viewError);
        // Continue even if view tracking fails
      }
    }

    // Get user's posts
    const Post = require('../models/Post');
    const posts = await Post.find({ 
      author: req.params.userId,
      isActive: true 
    })
      .populate('author', 'name role department profileImage')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`Profile route - Found ${posts.length} posts for user ${req.params.userId}`);

    // Get viewer info for filtering
    const viewer = await User.findById(req.user.id);
    
    // Filter posts based on viewer's eligibility with error handling
    const filteredPosts = posts.filter(post => {
      try {
        return post.canUserView(viewer);
      } catch (filterError) {
        console.error('Error filtering post:', filterError);
        return false; // Skip posts that cause errors
      }
    });

    console.log(`Profile route - After filtering: ${filteredPosts.length} posts visible`);

    // Get total post count - if viewing own profile, show all active posts
    // If viewing someone else's profile, show count of posts they can see
    let totalPosts;
    if (req.params.userId === req.user.id) {
      // Own profile - show all active posts
      totalPosts = await Post.countDocuments({
        author: req.params.userId,
        isActive: true
      });
    } else {
      // Someone else's profile - show count of posts viewer can see
      totalPosts = filteredPosts.length;
    }

    console.log(`Profile route - Total post count: ${totalPosts}`);

    // Get unique profile viewers count (count unique viewers)
    const uniqueViewers = new Set(
      (user.profileViews || [])
        .filter(view => view && view.viewer) // Filter out any null viewers
        .map(view => view.viewer.toString())
    );
    const profileViewers = uniqueViewers.size;

    // Get connections count (accepted connections only)
    const connections = user.connections || [];
    const connectionsCount = connections.filter(conn => conn.status === 'accepted').length;

    // Get communities count (for now, return 0 - will implement later)
    const communitiesCount = 0;

    res.json({
      user,
      posts: filteredPosts,
      stats: {
        postCount: totalPosts,
        profileViewers,
        connectionsCount,
        communitiesCount
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const { name, phone, location, department, course, batch, bio } = req.body;
    
    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (phone) profileFields.phone = phone;
    if (location) profileFields.location = location;
    if (department) profileFields.department = department;
    if (course) profileFields.course = course;
    if (batch) profileFields.batch = batch;
    if (bio) profileFields.bio = bio;

    // Handle image upload to Cloudinary
    if (req.file) {
      try {
        console.log('Uploading image to Cloudinary...');
        
        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'collegeconnect/profiles',
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ]
        });

        console.log('Image uploaded successfully:', result.secure_url);

        // Add image URL to profile fields
        profileFields.profileImage = result.secure_url;
        profileFields.profileImagePublicId = result.public_id;

      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return res.status(500).json({ message: 'Error uploading image' });
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    console.log('Profile updated successfully for user:', req.user.id);
    console.log('Updated user data:', {
      name: user.name,
      profileImage: user.profileImage,
      profileImagePublicId: user.profileImagePublicId
    });

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user 
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/profile/image
// @desc    Delete profile image
// @access  Private
router.delete('/image', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.profileImagePublicId) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(user.profileImagePublicId);
    }

    // Remove image from user profile
    user.profileImage = null;
    user.profileImagePublicId = null;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Profile image deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
