import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Pin, 
  MoreHorizontal,
  MapPin,
  Calendar,
  ExternalLink,
  Building2
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const PostCard = ({ post, onPostUpdate }) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [voting, setVoting] = useState(false);

  const handleVote = async (optionIndex) => {
    if (voting) return;
    
    try {
      setVoting(true);
      const response = await api.post(`/posts/${post._id}/vote`, {
        optionIndex
      });
      
      // Update the post data with new vote counts
      if (onPostUpdate) {
        onPostUpdate(response.data.post);
      }
      
      toast.success('Vote recorded!');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(error.response?.data?.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'principal': return 'bg-indigo-100 text-indigo-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'alumni': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'announcement': return 'bg-red-50';
      case 'opportunity': return 'bg-green-50';
      case 'blog': return 'bg-blue-50';
      default: return 'bg-white';
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return postDate.toLocaleDateString();
  };

  // Safety check for post data
  if (!post || !post.author) {
    return null;
  }

  return (
    <div className={`bg-white w-full p-4 transition-all ${getPostTypeColor(post.postType)}`}>
      {/* Pinned Badge */}
      {post.isPinned && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow-sm">
          <Pin size={16} fill="white" />
          <span className="text-sm font-semibold">Pinned Post</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          {/* Profile Picture */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
            {post.author?.profileImage ? (
              <img 
                src={post.author.profileImage} 
                alt={post.author.name || 'User'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {post.author?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-bold text-gray-900 truncate">
                {post.author?.name || 'Unknown User'}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${getRoleBadgeColor(post.author?.role || 'student')}`}>
                {post.author?.role ? post.author.role.charAt(0).toUpperCase() + post.author.role.slice(1) : 'Student'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {post.author?.department || 'Unknown Department'}
              {post.author?.currentCompany && (
                <span> • {post.author.currentCompany}</span>
              )}
              <span> • {formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* More Options */}
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="post-content text-gray-800 leading-relaxed">
          {post.content}
        </p>

        {/* Poll Details */}
        {post.postType === 'poll' && post.pollDetails && (
          <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-sm">
            <h4 className="font-bold text-blue-900 mb-4 text-lg">
              {post.pollDetails.question}
            </h4>
            
            <div className="space-y-3">
              {post.pollDetails.options.map((option, index) => {
                const totalVotes = post.pollDetails.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
                const optionVotes = option.votes?.length || 0;
                const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleVote(index)}
                    disabled={voting}
                    className={`w-full p-3 bg-white border-2 border-blue-200 rounded-xl hover:border-blue-300 transition-all text-left relative overflow-hidden ${
                      voting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div 
                      className="absolute inset-0 bg-blue-100 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative flex items-center justify-between">
                      <span className="font-medium text-gray-900">{option.text}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{optionVotes} votes</span>
                        <span className="text-sm font-bold text-blue-600">{percentage}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 pt-3 border-t border-blue-200 text-sm text-blue-600">
              <div className="flex items-center justify-between">
                <span>
                  Total votes: {post.pollDetails.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0)}
                </span>
                {post.pollDetails.endsAt && (
                  <span>
                    Ends: {new Date(post.pollDetails.endsAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Opportunity Details */}
        {post.postType === 'opportunity' && post.opportunityDetails && (
          <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-green-900 mb-1 text-lg">
                  {post.opportunityDetails.title}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-green-700">
                  <div className="flex items-center space-x-1">
                    <Building2 size={16} />
                    <span className="font-medium">{post.opportunityDetails.company}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} />
                    <span>{post.opportunityDetails.location}</span>
                  </div>
                </div>
              </div>
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                {post.opportunityDetails.type}
              </span>
            </div>
            
            {post.opportunityDetails.applicationDeadline && (
              <div className="flex items-center space-x-1 text-sm text-green-600 mb-3 font-medium">
                <Calendar size={16} />
                <span>Apply by: {new Date(post.opportunityDetails.applicationDeadline).toLocaleDateString()}</span>
              </div>
            )}

            <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2">
              <span>Apply Now</span>
              <ExternalLink size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            {post.media.slice(0, 4).map((media, index) => (
              <div key={index} className="relative">
                {media.type === 'image' ? (
                  <img 
                    src={media.url} 
                    alt="Post media"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <video 
                    src={media.url}
                    className="w-full h-48 object-cover rounded-lg"
                    controls
                  />
                )}
                {index === 3 && post.media.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold">
                      +{post.media.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3 pb-3 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <span>{post.likeCount} likes</span>
          <span>{post.commentCount} comments</span>
        </div>
        <span>2 shares</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around gap-2">
        <button 
          onClick={() => setLiked(!liked)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${
            liked 
              ? 'text-red-600 bg-red-50' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Heart size={20} strokeWidth={2.5} className={liked ? 'fill-current' : ''} />
          <span>Like</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold transition-all"
        >
          <MessageCircle size={20} strokeWidth={2.5} />
          <span>Comment</span>
        </button>

        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold transition-all">
          <Share2 size={20} strokeWidth={2.5} />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Comment Input */}
          <div className="flex space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-medium text-sm">
                U
              </span>
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Write a comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 && (
            <div className="space-y-3">
              {post.comments.map((comment, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 font-medium text-sm">
                      {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {comment.user?.name || 'Unknown User'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(comment.user?.role || 'student')}`}>
                          {comment.user?.role || 'student'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <button className="hover:text-gray-700">Like</button>
                      <button className="hover:text-gray-700">Reply</button>
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(PostCard);