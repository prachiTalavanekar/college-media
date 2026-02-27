const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // For community messages
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    index: true
  },
  
  // For direct messages
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'announcement'],
    default: 'text'
  },
  
  // For direct messages
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'voice'],
    default: 'text'
  },
  fileUrl: String,
  fileName: String,
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // For community messages
  attachments: [{
    url: String,
    filename: String,
    fileType: String,
    fileSize: Number
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pinnedAt: Date,
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
      default: 'like'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ community: 1, createdAt: -1 }); // For community messages
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 }); // For direct messages
messageSchema.index({ recipient: 1, read: 1 }); // For unread count
messageSchema.index({ sender: 1 });
messageSchema.index({ isPinned: 1, community: 1 });

// Virtual for reaction counts
messageSchema.virtual('reactionCounts').get(function() {
  const counts = {};
  this.reactions.forEach(reaction => {
    counts[reaction.type] = (counts[reaction.type] || 0) + 1;
  });
  return counts;
});

// Method to add reaction
messageSchema.methods.addReaction = function(userId, type = 'like') {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    type: type
  });
  
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  return this.save();
};

// Method to mark message as read (for direct messages)
messageSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Method to pin message
messageSchema.methods.pinMessage = function(userId) {
  this.isPinned = true;
  this.pinnedBy = userId;
  this.pinnedAt = new Date();
  return this.save();
};

// Method to unpin message
messageSchema.methods.unpinMessage = function() {
  this.isPinned = false;
  this.pinnedBy = undefined;
  this.pinnedAt = undefined;
  return this.save();
};

// Method to soft delete
messageSchema.methods.softDelete = function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

// Static method to get community messages
messageSchema.statics.getCommunityMessages = async function(communityId, options = {}) {
  const { page = 1, limit = 50, includePinned = true } = options;
  const skip = (page - 1) * limit;

  // Get regular messages (not pinned) in chronological order (oldest first)
  let regularMessages = await this.find({ 
    community: communityId, 
    isDeleted: false,
    isPinned: false
  })
  .populate('sender', 'name role profileImage department')
  .sort({ createdAt: 1 }) // Ascending order (oldest first)
  .skip(skip)
  .limit(limit);

  let messages = regularMessages;

  // If including pinned messages, get them separately
  if (includePinned && page === 1) {
    const pinnedMessages = await this.find({
      community: communityId,
      isPinned: true,
      isDeleted: false
    })
    .populate('sender', 'name role profileImage department')
    .populate('pinnedBy', 'name role')
    .sort({ pinnedAt: -1 }); // Most recently pinned first

    // Combine: pinned messages first, then regular messages in chronological order
    messages = [...pinnedMessages, ...regularMessages];
  }

  return messages;
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function(user1Id, user2Id, options = {}) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  return await this.find({
    $or: [
      { sender: user1Id, recipient: user2Id },
      { sender: user2Id, recipient: user1Id }
    ],
    isDeleted: false
  })
  .populate('sender', 'name profileImage role department')
  .populate('recipient', 'name profileImage role department')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get unread message count for a user
messageSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    recipient: userId,
    read: false,
    isDeleted: false
  });
};

module.exports = mongoose.model('Message', messageSchema);