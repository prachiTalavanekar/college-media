const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // College Verification Fields
  collegeId: {
    type: String,
    required: true,
    unique: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: function() {
      return this.role === 'student' || this.role === 'alumni';
    },
    enum: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Administration', 'Other']
  },
  course: {
    type: String,
    required: function() {
      return this.role === 'student' || this.role === 'alumni';
    },
    enum: ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA', 'B.Sc', 'M.Sc', 'B.Com', 'M.Com', 'BA', 'MA', 'B.E', 'M.E', 'Admin', 'Other']
  },
  batch: {
    type: String,
    required: function() {
      return this.role === 'student' || this.role === 'alumni';
    } // e.g., "2020-2024" or "2023"
  },
  
  // Role & Status
  role: {
    type: String,
    enum: ['student', 'alumni', 'teacher', 'principal', 'admin'],
    default: 'student'
  },
  verificationStatus: {
    type: String,
    enum: ['pending_verification', 'verified', 'blocked'],
    default: 'pending_verification'
  },
  
  // Block reason (if blocked)
  blockReason: {
    type: String,
    default: ''
  },
  
  // Profile Info
  profileImage: {
    type: String,
    default: ''
  },
  profileImagePublicId: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500
  },
  interests: {
    type: String,
    maxlength: 300
  },
  skills: [{
    type: String
  }],
  
  // Student Specific
  currentYear: {
    type: Number,
    min: 1,
    max: 5
  },
  currentSemester: {
    type: Number,
    min: 1,
    max: 10
  },
  
  // Alumni Specific
  graduationYear: {
    type: Number
  },
  currentCompany: {
    type: String
  },
  jobTitle: {
    type: String
  },
  alumni: {
    type: Boolean,
    default: false
  },
  mentor: {
    type: Boolean,
    default: false
  },
  verified_recruiter: {
    type: Boolean,
    default: false
  },
  
  // Teacher Specific
  teacher_verified: {
    type: Boolean,
    default: false
  },
  department_head: {
    type: Boolean,
    default: false
  },
  
  // Privacy Settings
  profileVisibility: {
    type: String,
    enum: ['public', 'college_only', 'private'],
    default: 'college_only'
  },
  showContactNumber: {
    type: Boolean,
    default: false
  },
  
  // Activity
  lastActive: {
    type: Date,
    default: Date.now
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  
  // Connections/Network
  connections: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    connectedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Connection Requests Sent
  connectionRequestsSent: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Connection Requests Received
  connectionRequestsReceived: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    receivedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Profile Views Tracking
  profileViews: [{
    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user is alumni
userSchema.methods.isAlumni = function() {
  return this.role === 'alumni' || (this.graduationYear && this.graduationYear <= new Date().getFullYear());
};

// Get user role permissions
userSchema.methods.getPermissions = function() {
  const role = this.role;
  
  // Base permissions for all roles
  const basePermissions = {
    canViewPosts: true,
    canComment: true,
    canLike: true,
    canShareInternally: true,
    canSavePosts: true,
    canReportPosts: true,
    canViewEvents: true,
    canRSVPEvents: true,
    canFollowUsers: true,
    canViewAcademicResources: true
  };
  
  // Student permissions
  if (role === 'student') {
    return {
      ...basePermissions,
      canCreatePosts: true,
      canJoinOpenCommunities: true,
      canRequestJoinRestrictedCommunities: true,
      canApplyToOpportunities: true,
      canMessageAlumni: true,
      canMessageTeachers: false, // Can be enabled by admin
      canMessageStudents: false, // Can be restricted
      // Cannot do
      canCreateCommunity: false,
      canPostAnnouncement: false,
      canUploadAcademicResources: false,
      canApproveUsers: false,
      canEditOthersPosts: false,
      canDeleteOthersPosts: false,
      canBroadcastMessages: false,
      canPostOpportunities: false,
      canModerateCommunity: false,
      canPinPosts: false,
      canCreatePolls: false,
      canVerifyUsers: false,
      canBlockUsers: false,
      canAccessAnalytics: false
    };
  }
  
  // Alumni permissions
  if (role === 'alumni') {
    return {
      ...basePermissions,
      canCreatePosts: true,
      canJoinOpenCommunities: true,
      canJoinAlumniCommunities: true,
      canPostOpportunities: true,
      canUploadStudyMaterials: true,
      canPostCareerGuidance: true,
      canOfferMentorship: this.mentor || false,
      canMessageStudents: true,
      canMessageTeachers: true,
      canMessageAlumni: true,
      canViewOpportunityDashboard: true,
      canViewMentorshipRequests: this.mentor || false,
      // Cannot do
      canPostAnnouncement: false,
      canVerifyUsers: false,
      canCreateCommunity: false,
      canEditAdminPosts: false,
      canEditTeacherPosts: false,
      canAccessAdminDashboard: false,
      canModerateCommunity: false,
      canPinPosts: false,
      canApproveUsers: false,
      canBlockUsers: false
    };
  }
  
  // Teacher permissions
  if (role === 'teacher') {
    return {
      ...basePermissions,
      canCreatePosts: true,
      canCreateCommunity: true,
      canManageCommunities: true,
      canPostAnnouncement: true,
      canPostBlogs: true,
      canPostEvents: true,
      canPostReels: true,
      canUploadAcademicResources: true,
      canPinPosts: true,
      canModerateComments: true,
      canApproveCommunityRequests: true,
      canMessageStudents: true,
      canMessageAlumni: true,
      canCreatePolls: true,
      canHighlightPosts: true,
      canViewDepartmentAnalytics: this.department_head || false,
      canViewCommunityStats: true,
      canJoinAllCommunities: true,
      // Cannot do
      canVerifyUsers: false,
      canBlockUsersPlatformWide: false,
      canModifySystemPermissions: false,
      canDeleteAdminPosts: false,
      canAccessAdminDashboard: false,
      canChangeUserRoles: false
    };
  }
  
  // Principal permissions (elevated teacher)
  if (role === 'principal') {
    return {
      ...basePermissions,
      canCreatePosts: true,
      canCreateCommunity: true,
      canManageCommunities: true,
      canPostAnnouncement: true,
      canPostCollegeWideAnnouncements: true,
      canPostBlogs: true,
      canPostEvents: true,
      canPostReels: true,
      canUploadAcademicResources: true,
      canPinPosts: true,
      canCreateFeaturedPosts: true,
      canModerateComments: true,
      canApproveCommunityRequests: true,
      canApproveEvents: true,
      canMessageStudents: true,
      canMessageAlumni: true,
      canMessageTeachers: true,
      canCreatePolls: true,
      canHighlightPosts: true,
      canViewPlatformAnalytics: true,
      canViewDepartmentAnalytics: true,
      canViewCommunityStats: true,
      canSendEmergencyNotifications: true,
      canJoinAllCommunities: true,
      // Cannot do
      canVerifyUsers: false,
      canBlockUsersPlatformWide: false,
      canModifySystemPermissions: false,
      canAccessAdminDashboard: false,
      canChangeUserRoles: false
    };
  }
  
  // Admin permissions (super user)
  if (role === 'admin') {
    return {
      ...basePermissions,
      canVerifyUsers: true,
      canChangeUserRoles: true,
      canBlockUsers: true,
      canSuspendUsers: true,
      canApproveContent: true,
      canRemoveContent: true,
      canHandleReports: true,
      canEnableDisableFeatures: true,
      canControlMessagingRules: true,
      canAccessLogs: true,
      canAccessAuditTrail: true,
      canAccessAdminDashboard: true,
      canViewAllAnalytics: true,
      canModifySystemPermissions: true,
      canManageAllCommunities: true,
      canDeleteAnyPost: true,
      canEditAnyPost: true,
      canBroadcastMessages: true,
      canCreateAnnouncements: true,
      // Admins typically don't participate socially
      canCreatePosts: false,
      canComment: false,
      canLike: false
    };
  }
  
  return basePermissions;
};

module.exports = mongoose.model('User', userSchema);