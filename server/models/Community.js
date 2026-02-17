const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Community Type
  type: {
    type: String,
    enum: ['department', 'course', 'batch', 'club', 'opportunities', 'events', 'general'],
    required: true
  },
  
  // Creator and Moderators
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Community Image
  coverImage: {
    type: String,
    default: ''
  },
  
  // Membership
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator'],
      default: 'member'
    }
  }],
  
  // Community Settings
  isPrivate: {
    type: Boolean,
    default: false
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  
  // Targeting (who can join)
  eligibility: {
    departments: [{
      type: String,
      enum: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'All']
    }],
    courses: [{
      type: String,
      enum: ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA', 'All']
    }],
    batches: [String],
    roles: [{
      type: String,
      enum: ['student', 'alumni', 'teacher', 'all']
    }]
  },
  
  // Community Rules
  rules: [{
    title: String,
    description: String
  }],
  
  // Statistics
  stats: {
    totalPosts: {
      type: Number,
      default: 0
    },
    totalMembers: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Join Requests (for approval-required communities)
  joinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    message: String
  }]
}, {
  timestamps: true
});

// Index for efficient searching
communitySchema.index({ name: 'text', description: 'text' });
communitySchema.index({ type: 1 });
communitySchema.index({ 'eligibility.departments': 1 });
communitySchema.index({ 'eligibility.courses': 1 });

// Virtual for member count
communitySchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method to check if user is eligible to join
communitySchema.methods.canUserJoin = function(user) {
  const { departments, courses, batches, roles } = this.eligibility;
  
  // Check department
  if (departments.length > 0 && !departments.includes('All') && !departments.includes(user.department)) {
    return false;
  }
  
  // Check course
  if (courses.length > 0 && !courses.includes('All') && !courses.includes(user.course)) {
    return false;
  }
  
  // Check batch
  if (batches.length > 0 && !batches.includes(user.batch)) {
    return false;
  }
  
  // Check role
  if (roles.length > 0 && !roles.includes('all') && !roles.includes(user.role)) {
    return false;
  }
  
  return true;
};

// Method to check if user is member
communitySchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Method to check if user is moderator
communitySchema.methods.isModerator = function(userId) {
  return this.moderators.includes(userId) || this.creator.toString() === userId.toString();
};

// Method to add member
communitySchema.methods.addMember = function(userId) {
  if (!this.isMember(userId)) {
    this.members.push({ user: userId });
    this.stats.totalMembers = this.members.length;
  }
};

// Method to remove member
communitySchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => member.user.toString() !== userId.toString());
  this.stats.totalMembers = this.members.length;
};

module.exports = mongoose.model('Community', communitySchema);