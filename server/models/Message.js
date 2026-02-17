const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for efficient conversation queries
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, read: 1 });

// Method to mark message as read
messageSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return await this.save();
};

// Static method to get unread count for a user
messageSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ recipient: userId, read: false });
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function(user1Id, user2Id, options = {}) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  const messages = await this.find({
    $or: [
      { sender: user1Id, recipient: user2Id },
      { sender: user2Id, recipient: user1Id }
    ]
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name profileImage role')
    .populate('recipient', 'name profileImage role');

  return messages.reverse(); // Return in chronological order
};

module.exports = mongoose.model('Message', messageSchema);
