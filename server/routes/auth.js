const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('collegeId').trim().isLength({ min: 1 }).withMessage('College ID is required'),
  body('contactNumber').trim().isLength({ min: 10 }).withMessage('Valid contact number is required'),
  body('role').isIn(['student', 'alumni', 'teacher', 'principal']).withMessage('Invalid role'),
  // Conditional validation for academic fields - only required for students and alumni
  body('department').custom((value, { req }) => {
    if ((req.body.role === 'student' || req.body.role === 'alumni') && !value) {
      throw new Error('Department is required for students and alumni');
    }
    if (value && !['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Other'].includes(value)) {
      throw new Error('Invalid department');
    }
    return true;
  }),
  body('course').custom((value, { req }) => {
    if ((req.body.role === 'student' || req.body.role === 'alumni') && !value) {
      throw new Error('Course is required for students and alumni');
    }
    if (value && !['B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA', 'Other'].includes(value)) {
      throw new Error('Invalid course');
    }
    return true;
  }),
  body('batch').custom((value, { req }) => {
    if ((req.body.role === 'student' || req.body.role === 'alumni') && !value) {
      throw new Error('Batch is required for students and alumni');
    }
    return true;
  })
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
      email,
      password,
      collegeId,
      contactNumber,
      department,
      course,
      batch,
      role
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { collegeId }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email.toLowerCase() 
          ? 'User with this email already exists'
          : 'User with this College ID already exists'
      });
    }

    // Check if this is admin registration
    const isAdminRegistration = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      collegeId: collegeId.trim(),
      contactNumber: contactNumber.trim(),
      department: (role === 'student' || role === 'alumni') ? department : undefined,
      course: (role === 'student' || role === 'alumni') ? course : undefined,
      batch: (role === 'student' || role === 'alumni') ? batch?.trim() : undefined,
      role: isAdminRegistration ? 'admin' : role,
      verificationStatus: isAdminRegistration ? 'verified' : 'pending_verification'
    });

    await user.save();

    const message = isAdminRegistration 
      ? 'Admin account created successfully! You can login immediately.'
      : 'Registration successful! Please wait for admin verification.';

    res.status(201).json({
      message,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
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

    // Check if this is admin login
    const isAdminLogin = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase() && 
                        password === process.env.ADMIN_PASSWORD;

    let user;

    if (isAdminLogin) {
      // Check if admin user exists
      user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        // Create admin user automatically
        user = new User({
          name: 'System Administrator',
          email: email.toLowerCase(),
          password: password,
          collegeId: 'ADMIN001',
          contactNumber: '+91-9999999999',
          department: 'Administration',
          course: 'Admin',
          batch: 'N/A',
          role: 'admin',
          verificationStatus: 'verified'
        });
        await user.save();
        console.log('✅ Admin user created automatically');
      } else if (user.role !== 'admin') {
        // Promote existing user to admin
        user.role = 'admin';
        user.verificationStatus = 'verified';
        await user.save();
        console.log('✅ User promoted to admin');
      }
    } else {
      // Regular user login
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Check if user is blocked
    if (user.verificationStatus === 'blocked') {
      return res.status(403).json({ 
        message: 'Your account has been blocked. Please contact admin for more information.',
        reason: user.blockReason || 'Account verification rejected'
      });
    }

    // Check if user is pending verification
    if (user.verificationStatus === 'pending_verification') {
      return res.status(403).json({ 
        message: 'Your account is pending verification. Please wait for admin approval.',
        status: 'pending_verification'
      });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user._id,
        role: user.role,
        verificationStatus: user.verificationStatus
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        course: user.course,
        batch: user.batch,
        phone: user.phone,
        location: user.location,
        verificationStatus: user.verificationStatus,
        profileImage: user.profileImage,
        profileImagePublicId: user.profileImagePublicId,
        bio: user.bio,
        currentCompany: user.currentCompany,
        jobTitle: user.jobTitle,
        profileVisibility: user.profileVisibility,
        showContactNumber: user.showContactNumber
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Auth/me called for user:', req.user.id);
    console.log('User profile image:', user.profileImage);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        course: user.course,
        batch: user.batch,
        collegeId: user.collegeId,
        contactNumber: user.contactNumber,
        phone: user.phone,
        location: user.location,
        verificationStatus: user.verificationStatus,
        profileImage: user.profileImage,
        profileImagePublicId: user.profileImagePublicId,
        bio: user.bio,
        currentCompany: user.currentCompany,
        jobTitle: user.jobTitle,
        graduationYear: user.graduationYear,
        profileVisibility: user.profileVisibility,
        showContactNumber: user.showContactNumber,
        joinedAt: user.joinedAt,
        lastActive: user.lastActive
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success message for security
    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

    // TODO: Implement email sending logic here
    if (user) {
      // Generate reset token and send email
      console.log(`Password reset requested for user: ${user.email}`);
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Update last active time
    await User.findByIdAndUpdate(req.user.id, { lastActive: new Date() });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;