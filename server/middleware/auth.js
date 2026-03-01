const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization');

    // Check if no token
    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Extract token from "Bearer TOKEN"
    const actualToken = token.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

    // Get user from database to ensure they still exist and are verified
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid - user not found' });
    }

    // Check if user is verified (except for getting user profile)
    if (user.verificationStatus === 'blocked') {
      return res.status(403).json({ 
        message: 'Your account has been blocked. Please contact admin for more information.',
        reason: user.blockReason || 'Account verification rejected'
      });
    }

    if (user.verificationStatus === 'pending_verification' && req.path !== '/me') {
      return res.status(403).json({ 
        message: 'Account verification pending. Please wait for admin approval.' 
      });
    }

    // Add user to request object
    req.user = {
      id: user._id,
      role: user.role,
      verificationStatus: user.verificationStatus,
      department: user.department,
      course: user.course,
      batch: user.batch
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token is not valid' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

// Middleware to check if user is verified
const requireVerified = (req, res, next) => {
  if (req.user.verificationStatus !== 'verified') {
    return res.status(403).json({ 
      message: 'Account verification required to access this resource' 
    });
  }
  next();
};

// Middleware to check user role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions to access this resource' 
      });
    }
    next();
  };
};

// Middleware to check if user can create communities
const canCreateCommunity = (req, res, next) => {
  const allowedRoles = ['teacher', 'principal', 'admin', 'alumni'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Only teachers, principals, admins, and alumni can create communities' 
    });
  }
  next();
};

// Middleware to check if user can post announcements
const canPostAnnouncement = (req, res, next) => {
  const allowedRoles = ['teacher', 'principal', 'admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Only teachers, principals, and admins can post announcements' 
    });
  }
  next();
};

// Middleware to check if user can post opportunities
const canPostOpportunity = (req, res, next) => {
  const allowedRoles = ['alumni', 'teacher', 'principal', 'admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Only alumni, teachers, principals, and admins can post opportunities' 
    });
  }
  next();
};

// Middleware to check if user can moderate
const canModerate = (req, res, next) => {
  const allowedRoles = ['teacher', 'principal', 'admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Only teachers, principals, and admins can moderate content' 
    });
  }
  next();
};

// Middleware to check if user can upload academic resources
const canUploadResources = (req, res, next) => {
  const allowedRoles = ['alumni', 'teacher', 'principal', 'admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Only alumni, teachers, principals, and admins can upload academic resources' 
    });
  }
  next();
};

// Middleware to check if user can manage communities
const canManageCommunity = (req, res, next) => {
  const allowedRoles = ['teacher', 'principal', 'admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Only teachers, principals, and admins can manage communities' 
    });
  }
  next();
};

// Middleware to check if user can access admin features
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Admin access required' 
    });
  }
  next();
};

// Middleware to check if user can send college-wide announcements
const canSendCollegeWideAnnouncement = (req, res, next) => {
  const allowedRoles = ['principal', 'admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Only principals and admins can send college-wide announcements' 
    });
  }
  next();
};

module.exports = {
  auth,
  requireVerified,
  requireRole,
  canCreateCommunity,
  canPostAnnouncement,
  canPostOpportunity,
  canModerate,
  canUploadResources,
  canManageCommunity,
  requireAdmin,
  canSendCollegeWideAnnouncement
};