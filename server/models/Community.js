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
    enum: ['department', 'course', 'batch', 'club', 'opportunities', 'events', 'general', 'subject', 'project', 'alumni_mentorship', 'alumni_jobs'],
    required: true
  },
  
  // Creator and Moderators
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorRole: {
    type: String,
    enum: ['teacher', 'alumni', 'principal', 'admin'],
    required: true
  },
  moderators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
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
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    },
    // Member engagement tracking
    lastActivity: {
      type: Date,
      default: Date.now
    },
    postsCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    // Moderation status
    warnings: [{
      reason: String,
      issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      issuedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isMuted: {
      type: Boolean,
      default: false
    },
    mutedUntil: Date
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
  
  // Academic Settings (for teacher communities)
  academicSettings: {
    subject: String,
    semester: String,
    academicYear: String,
    allowStudentPosts: {
      type: Boolean,
      default: true
    },
    allowFileUploads: {
      type: Boolean,
      default: true
    },
    allowPolls: {
      type: Boolean,
      default: true
    },
    moderationLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  
  // Targeting (who can join)
  eligibility: {
    departments: [{
      type: String,
      enum: ['Computer Science', 'Information Technology', 'Accounting & Finance', 'Business and Management Studies', 'Science', 'Arts', 'Commerce', 'All']
    }],
    courses: [{
      type: String,
      enum: ['BSc Computer Science', 'MSc Computer Science', 'BAF', 'BMS', 'BA', 'MCom', 'BCom', 'BSc IT', 'MSc IT', 'All']
    }],
    batches: [String],
    roles: [{
      type: String,
      enum: ['student', 'alumni', 'teacher', 'all']
    }]
  },
  
  // Visibility Control (who can see this community)
  visibleTo: {
    roles: [{
      type: String,
      enum: ['student', 'alumni', 'teacher', 'principal', 'all'],
      default: 'all'
    }],
    departments: [{
      type: String
    }],
    courses: [{
      type: String
    }]
  },
  
  // Community Rules and Purpose
  purpose: {
    type: String,
    maxlength: 1000
  },
  rules: [{
    title: String,
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Content Management
  pinnedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  
  // Study Materials
  studyMaterials: [{
    title: String,
    description: String,
    fileUrl: String,
    fileType: {
      type: String,
      enum: ['pdf', 'ppt', 'doc', 'docx', 'xls', 'xlsx', 'image', 'video', 'other']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['lecture', 'assignment', 'reference', 'syllabus', 'notes', 'other']
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  }],
  
  // Assignments
  assignments: [{
    title: String,
    description: String,
    dueDate: Date,
    attachments: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    submissions: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      submittedAt: Date,
      fileUrl: String,
      grade: String,
      feedback: String
    }]
  }],
  
  // Events
  events: [{
    title: String,
    description: String,
    date: Date,
    time: String,
    location: String,
    type: {
      type: String,
      enum: ['lecture', 'seminar', 'workshop', 'exam', 'meeting', 'other']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    attendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
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
    activeMembers: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    totalMaterials: {
      type: Number,
      default: 0
    },
    totalAssignments: {
      type: Number,
      default: 0
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
    message: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  }],
  
  // Moderation Logs
  moderationLogs: [{
    action: {
      type: String,
      enum: ['member_removed', 'post_deleted', 'comment_deleted', 'warning_issued', 'member_muted', 'member_promoted']
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Index for efficient searching
communitySchema.index({ name: 'text', description: 'text' });
communitySchema.index({ type: 1 });
communitySchema.index({ 'eligibility.departments': 1 });
communitySchema.index({ 'eligibility.courses': 1 });
communitySchema.index({ creator: 1 });
communitySchema.index({ 'members.user': 1 });

// Virtual for member count
communitySchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method to check if community is visible to user
communitySchema.methods.isVisibleTo = function(user) {
  // If no visibility restrictions, show to all
  if (!this.visibleTo || !this.visibleTo.roles || this.visibleTo.roles.length === 0 || this.visibleTo.roles.includes('all')) {
    return true;
  }
  
  // Check role visibility
  if (!this.visibleTo.roles.includes(user.role)) {
    return false;
  }
  
  // If visible to this role, check department/course restrictions
  if (this.visibleTo.departments && this.visibleTo.departments.length > 0) {
    if (!this.visibleTo.departments.includes(user.department)) {
      return false;
    }
  }
  
  if (this.visibleTo.courses && this.visibleTo.courses.length > 0) {
    if (!this.visibleTo.courses.includes(user.course)) {
      return false;
    }
  }
  
  return true;
};

// Method to check if user is eligible to join
communitySchema.methods.canUserJoin = function(user) {
  const { departments, courses, batches, roles } = this.eligibility;
  
  console.log('canUserJoin - Checking eligibility for user:', {
    userDept: user.department,
    userCourse: user.course,
    userBatch: user.batch,
    userRole: user.role
  });
  console.log('canUserJoin - Community eligibility criteria:', {
    departments,
    courses,
    batches,
    roles
  });
  
  // Check department
  if (departments && departments.length > 0 && !departments.includes('All') && !departments.includes(user.department)) {
    console.log('canUserJoin - Failed department check:', {
      userDept: user.department,
      allowedDepts: departments
    });
    return false;
  }
  
  // Check course
  if (courses && courses.length > 0 && !courses.includes('All') && !courses.includes(user.course)) {
    console.log('canUserJoin - Failed course check:', {
      userCourse: user.course,
      allowedCourses: courses
    });
    return false;
  }
  
  // Check batch
  if (batches && batches.length > 0 && !batches.includes(user.batch)) {
    console.log('canUserJoin - Failed batch check:', {
      userBatch: user.batch,
      allowedBatches: batches
    });
    return false;
  }
  
  // Check role
  if (roles && roles.length > 0 && !roles.includes('all') && !roles.includes(user.role)) {
    console.log('canUserJoin - Failed role check:', {
      userRole: user.role,
      allowedRoles: roles
    });
    return false;
  }
  
  console.log('canUserJoin - All checks passed');
  return true;
};

// Method to get detailed eligibility information for error messages
communitySchema.methods.getEligibilityDetails = function(user) {
  const { departments, courses, batches, roles } = this.eligibility;
  const details = {
    canJoin: true,
    reasons: []
  };
  
  // Check each criteria and collect failure reasons
  if (departments && departments.length > 0 && !departments.includes('All') && !departments.includes(user.department)) {
    details.canJoin = false;
    details.reasons.push(`Department: Required ${departments.join(' or ')}, but you are in ${user.department}`);
  }
  
  if (courses && courses.length > 0 && !courses.includes('All') && !courses.includes(user.course)) {
    details.canJoin = false;
    details.reasons.push(`Course: Required ${courses.join(' or ')}, but you are in ${user.course}`);
  }
  
  if (batches && batches.length > 0 && !batches.includes(user.batch)) {
    details.canJoin = false;
    details.reasons.push(`Batch: Required ${batches.join(' or ')}, but you are in ${user.batch}`);
  }
  
  if (roles && roles.length > 0 && !roles.includes('all') && !roles.includes(user.role)) {
    details.canJoin = false;
    details.reasons.push(`Role: Required ${roles.join(' or ')}, but you are ${user.role}`);
  }
  
  return details;
};

// Method to check if user can access community content
communitySchema.methods.canAccessContent = function(userId) {
  // Members and moderators can access content
  return this.isMember(userId) || this.isModerator(userId);
};

// Method to check if user is member
communitySchema.methods.isMember = function(userId) {
  return this.members.some(member => {
    const memberUserId = member.user._id ? member.user._id.toString() : member.user.toString();
    return memberUserId === userId.toString();
  });
};

// Method to check if user is moderator or admin
communitySchema.methods.isModerator = function(userId) {
  const member = this.members.find(m => {
    const memberUserId = m.user._id ? m.user._id.toString() : m.user.toString();
    return memberUserId === userId.toString();
  });
  return member && (member.role === 'moderator' || member.role === 'admin') || 
         this.creator.toString() === userId.toString() ||
         this.moderators.some(mod => {
           const modUserId = mod.user._id ? mod.user._id.toString() : mod.user.toString();
           return modUserId === userId.toString();
         });
};

// Method to check if user is admin (creator or admin role)
communitySchema.methods.isAdmin = function(userId) {
  const member = this.members.find(m => {
    const memberUserId = m.user._id ? m.user._id.toString() : m.user.toString();
    return memberUserId === userId.toString();
  });
  return this.creator.toString() === userId.toString() || 
         (member && member.role === 'admin');
};

// Method to add member
communitySchema.methods.addMember = function(userId, role = 'member') {
  if (!this.isMember(userId)) {
    this.members.push({ 
      user: userId, 
      role: role,
      joinedAt: new Date(),
      lastActivity: new Date()
    });
    this.stats.totalMembers = this.members.length;
  }
};

// Method to remove member
communitySchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => {
    const memberUserId = member.user._id ? member.user._id.toString() : member.user.toString();
    return memberUserId !== userId.toString();
  });
  this.stats.totalMembers = this.members.length;
};

// Method to promote member
communitySchema.methods.promoteMember = function(userId, newRole) {
  const member = this.members.find(m => {
    const memberUserId = m.user._id ? m.user._id.toString() : m.user.toString();
    return memberUserId === userId.toString();
  });
  if (member) {
    member.role = newRole;
  }
};

// Method to issue warning
communitySchema.methods.issueWarning = function(userId, reason, issuedBy) {
  const member = this.members.find(m => {
    const memberUserId = m.user._id ? m.user._id.toString() : m.user.toString();
    return memberUserId === userId.toString();
  });
  if (member) {
    member.warnings.push({
      reason: reason,
      issuedBy: issuedBy,
      issuedAt: new Date()
    });
  }
};

// Method to mute member
communitySchema.methods.muteMember = function(userId, duration) {
  const member = this.members.find(m => {
    const memberUserId = m.user._id ? m.user._id.toString() : m.user.toString();
    return memberUserId === userId.toString();
  });
  if (member) {
    member.isMuted = true;
    if (duration) {
      member.mutedUntil = new Date(Date.now() + duration);
    }
  }
};

// Method to add moderation log
communitySchema.methods.addModerationLog = function(action, targetUser, moderator, reason, details) {
  this.moderationLogs.push({
    action: action,
    targetUser: targetUser,
    moderator: moderator,
    reason: reason,
    details: details,
    timestamp: new Date()
  });
};

module.exports = mongoose.model('Community', communitySchema);