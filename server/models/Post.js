const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Content
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: String // Cloudinary public ID for deletion
  }],
  
  // Post Type
  postType: {
    type: String,
    enum: ['announcement', 'blog', 'reel', 'story', 'community_post', 'opportunity', 'event', 'poll'],
    default: 'community_post'
  },
  
  // Important/Highlighted Post (for teachers/admin)
  isImportant: {
    type: Boolean,
    default: false
  },
  
  // Targeting
  targetAudience: {
    departments: [{
      type: String,
      enum: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'All']
    }],
    courses: [{
      type: String,
      enum: ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA', 'All']
    }],
    batches: [String], // e.g., ["2020-2024", "2021-2025"]
    roles: [{
      type: String,
      enum: ['student', 'alumni', 'teacher', 'all']
    }]
  },
  
  // Community Association
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  
  // Opportunity Specific Fields
  opportunityDetails: {
    title: String,
    company: String,
    location: String,
    type: {
      type: String,
      enum: ['internship', 'job', 'freelance', 'project']
    },
    applicationDeadline: Date,
    requirements: [String],
    contactEmail: String,
    externalLink: String
  },
  
  // Event Specific Fields
  eventDetails: {
    title: String,
    date: Date,
    time: String,
    location: String,
    registrationLink: String
  },
  
  // Poll Specific Fields
  pollDetails: {
    question: String,
    options: [{
      text: String,
      votes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }]
    }],
    duration: {
      type: Number,
      default: 7 // days
    },
    endsAt: Date
  },
  
  // Engagement
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Moderation
  isReported: {
    type: Boolean,
    default: false
  },
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Visibility
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  
  // Story specific
  expiresAt: {
    type: Date // For stories that expire after 24 hours
  }
}, {
  timestamps: true
});

// Index for efficient querying
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ postType: 1, createdAt: -1 });
postSchema.index({ 'targetAudience.departments': 1 });
postSchema.index({ 'targetAudience.courses': 1 });
postSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired stories

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to check if user can view this post
postSchema.methods.canUserView = function(user) {
  if (!this.isActive) return false;
  
  // If user is not provided or doesn't have required fields, deny access
  if (!user || !user.department || !user.course || !user.role) {
    return false;
  }
  
  const { departments, courses, batches, roles } = this.targetAudience || {};
  
  // Check department
  if (departments && departments.length > 0 && !departments.includes('All') && !departments.includes(user.department)) {
    return false;
  }
  
  // Check course
  if (courses && courses.length > 0 && !courses.includes('All') && !courses.includes(user.course)) {
    return false;
  }
  
  // Check batch
  if (batches && batches.length > 0 && user.batch && !batches.includes(user.batch)) {
    return false;
  }
  
  // Check role
  if (roles && roles.length > 0 && !roles.includes('all') && !roles.includes(user.role)) {
    return false;
  }
  
  return true;
};

module.exports = mongoose.model('Post', postSchema);