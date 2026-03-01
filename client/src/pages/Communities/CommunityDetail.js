import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Image, 
  FileText, 
  Download,
  Users,
  Settings,
  Pin,
  Calendar,
  BookOpen,
  Upload,
  Plus,
  MoreVertical,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCommunityDetails();
    fetchMessages();
    fetchStudyMaterials();
    fetchAssignments();
  }, [id]);

  // Add a refresh mechanism that can be triggered externally
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Refreshing community details...');
      fetchCommunityDetails();
      fetchMessages();
      fetchStudyMaterials();
      fetchAssignments();
    };

    // Listen for custom refresh event
    window.addEventListener('refreshCommunityDetail', handleRefresh);
    
    // Expose refresh function globally for debugging
    window.refreshCommunityDetail = handleRefresh;

    return () => {
      window.removeEventListener('refreshCommunityDetail', handleRefresh);
      delete window.refreshCommunityDetail;
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCommunityDetails = async () => {
    try {
      const response = await api.get(`/communities/${id}`);
      console.log('Community API Response:', response.data.community);
      setCommunity(response.data.community);
      
      // Enhanced access check - allow access if user is member or moderator
      const hasAccess = response.data.community.isMember || 
                       response.data.community.isModerator;
      
      if (!hasAccess) {
        console.log('Access denied - isMember:', response.data.community.isMember, 
                   'isModerator:', response.data.community.isModerator);
        toast.error('You do not have access to this community');
        navigate('/communities');
        return;
      }
      console.log('Access granted - hasAccess:', hasAccess);
    } catch (error) {
      console.error('Error fetching community:', error);
      toast.error('Failed to load community');
      navigate('/communities');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/communities/${id}/messages`);
      let messages = response.data.messages || [];
      
      // Sort messages by creation time (oldest first) for proper chat order
      messages = messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // Separate pinned messages and regular messages
      const pinnedMessages = messages.filter(msg => msg.isPinned);
      const regularMessages = messages.filter(msg => !msg.isPinned);
      
      // Show pinned messages at the top, then regular messages in chronological order
      const sortedMessages = [...pinnedMessages, ...regularMessages];
      
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Fallback to sample messages if API fails
      setMessages([
        {
          _id: '1',
          sender: { name: 'Dr. Smith', role: 'teacher', profileImage: '' },
          content: 'Welcome to this community! 📚',
          type: 'text',
          createdAt: new Date(Date.now() - 86400000),
          isPinned: true
        }
      ]);
    }
  };

  const fetchStudyMaterials = async () => {
    try {
      const response = await api.get(`/communities/${id}/study-materials`);
      setStudyMaterials(response.data.materials || []);
    } catch (error) {
      console.error('Error fetching study materials:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/communities/${id}/assignments`);
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await api.post(`/communities/${id}/messages`, { 
        content: newMessage,
        type: 'text'
      });

      // Add the message to local state in correct order
      if (response.data.data) {
        setMessages(prev => {
          // Add new message at the end (most recent)
          const updatedMessages = [...prev, response.data.data];
          
          // Sort to ensure proper order (pinned first, then chronological)
          const pinnedMessages = updatedMessages.filter(msg => msg.isPinned);
          const regularMessages = updatedMessages.filter(msg => !msg.isPinned)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          
          return [...pinnedMessages, ...regularMessages];
        });
      }
      
      setNewMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  const handleReaction = async (messageId, type = 'like') => {
    try {
      await api.post(`/communities/${id}/messages/${messageId}/react`, { type });
      // Refresh messages to show updated reactions
      fetchMessages();
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const handlePinMessage = async (messageId) => {
    try {
      await api.post(`/communities/${id}/messages/${messageId}/pin`);
      toast.success('Message pin status updated');
      fetchMessages();
    } catch (error) {
      console.error('Error pinning message:', error);
      toast.error('Failed to update pin status');
    }
  };

  const handleFileUpload = async (file, type = 'material') => {
    try {
      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 50MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'video/mpeg'
      ];

      const isTypeAllowed = allowedTypes.some(type => file.type === type) || 
                           file.type.startsWith('image/') || 
                           file.type.startsWith('video/') || 
                           file.type.startsWith('text/');

      if (!isTypeAllowed) {
        toast.error('File type not supported. Please upload documents, images, or media files.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('category', 'lecture');

      if (type === 'material') {
        toast.loading('Uploading study material...', { id: 'upload' });
        
        const response = await api.post(`/communities/${id}/study-materials`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        toast.success('Study material uploaded successfully', { id: 'upload' });
        fetchStudyMaterials();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to upload file';
      
      toast.error(errorMessage, { id: 'upload' });
    }
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now - messageDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return messageDate.toLocaleDateString();
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-600" />;
      case 'image': return <Image className="w-5 h-5 text-blue-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Community not found</h2>
          <button 
            onClick={() => navigate('/communities')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Communities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/communities')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {community.coverImage ? (
                <img 
                  src={community.coverImage} 
                  alt={community.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <BookOpen className="w-5 h-5 text-blue-600" />
              )}
            </div>
            
            <div>
              <h1 className="font-semibold text-gray-900">{community.name}</h1>
              <p className="text-sm text-gray-500">
                {community.stats?.totalMembers || 0} members
              </p>
            </div>
          </div>
        </div>

          <div className="flex items-center space-x-2">
            {/* Debug refresh button */}
            <button 
              onClick={() => {
                console.log('Manual refresh triggered');
                fetchCommunityDetails();
                fetchMessages();
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh (Debug)"
            >
              🔄
            </button>
            
            {community.isModerator && (
              <button 
                onClick={() => setShowUploadModal(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Upload Content"
              >
                <Upload size={20} />
              </button>
            )}
            
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex space-x-6">
          {community.creatorRole === 'alumni' ? (
            // Alumni community tabs
            ['chat', 'opportunities', 'resources'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'chat' && 'Chat'}
                {tab === 'opportunities' && 'Job Opportunities'}
                {tab === 'resources' && 'Career Resources'}
              </button>
            ))
          ) : (
            // Teacher community tabs
            ['chat', 'materials', 'assignments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'chat' && 'Chat'}
                {tab === 'materials' && 'Study Materials'}
                {tab === 'assignments' && 'Assignments'}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message._id} className={`flex items-start space-x-3 ${message.isPinned ? 'bg-yellow-50 border border-yellow-200 rounded-lg p-3' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {message.sender.profileImage ? (
                      <img 
                        src={message.sender.profileImage} 
                        alt={message.sender.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium text-sm">
                        {message.sender.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {message.sender.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          message.sender.role === 'teacher' 
                            ? 'bg-green-100 text-green-700'
                            : message.sender.role === 'admin'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {message.sender.role}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.createdAt)}
                        </span>
                        {message.isPinned && (
                          <div className="flex items-center space-x-1 text-yellow-600">
                            <Pin className="w-3 h-3" />
                            <span className="text-xs">Pinned</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Message Actions */}
                      {community.isModerator && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handlePinMessage(message._id)}
                            className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                            title={message.isPinned ? 'Unpin message' : 'Pin message'}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className={`rounded-lg p-3 ${
                      message.type === 'announcement' 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-gray-50'
                    }`}>
                      <p className="text-gray-900">{message.content}</p>
                    </div>
                    
                    {/* Message Reactions */}
                    <div className="flex items-center space-x-3 mt-2">
                      <button
                        onClick={() => handleReaction(message._id, 'like')}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-xs">
                          {message.reactionCounts?.like || 0}
                        </span>
                      </button>
                      
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs">Reply</span>
                      </button>
                      
                      {(community.isModerator || message.sender._id === user.id) && (
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                          <Share2 className="w-4 h-4" />
                          <span className="text-xs">Share</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {community.academicSettings?.allowStudentPosts || community.isModerator ? (
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Paperclip size={20} />
                  </button>
                  
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 p-4 bg-gray-50 text-center">
                <p className="text-gray-500 text-sm">
                  Only teachers can post messages in this community
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Study Materials</h2>
              {community.isModerator && (
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  <span>Upload</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studyMaterials.map((material) => (
                <div key={material._id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getFileIcon(material.fileType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {material.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {material.category} • {formatTime(material.uploadedAt)}
                      </p>
                      {material.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {material.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      By {material.uploadedBy?.name || 'Unknown'}
                    </span>
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {studyMaterials.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No study materials yet</h3>
                <p className="text-gray-500">
                  {community.isModerator 
                    ? 'Upload your first study material to get started'
                    : 'Your teacher will upload study materials here'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
              {community.isModerator && (
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus size={16} />
                  <span>Create Assignment</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Pending
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {assignment.submissions?.length || 0} submissions
                    </span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {assignments.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                <p className="text-gray-500">
                  {community.isModerator 
                    ? 'Create your first assignment to get started'
                    : 'Your teacher will post assignments here'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Alumni Community - Job Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Job Opportunities</h2>
              {community.isModerator && (
                <button 
                  onClick={() => setShowOpportunityModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  <span>Post Opportunity</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {opportunities.map((opportunity) => (
                <div key={opportunity._id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{opportunity.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{opportunity.company}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {opportunity.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          Posted {formatTime(opportunity.postedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{opportunity.description}</p>
                  
                  {opportunity.link && (
                    <a
                      href={opportunity.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <span>Apply Now</span>
                      <ArrowRight size={16} />
                    </a>
                  )}
                </div>
              ))}
            </div>

            {opportunities.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities yet</h3>
                <p className="text-gray-500">
                  {community.isModerator 
                    ? 'Post your first job opportunity to help students'
                    : 'Alumni will post job opportunities here'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Alumni Community - Career Resources Tab */}
        {activeTab === 'resources' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Career Resources</h2>
              {community.isModerator && (
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  <span>Upload Resource</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyMaterials.map((resource) => (
                <div key={resource._id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getFileIcon(resource.fileType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatTime(resource.uploadedAt)}
                      </p>
                      {resource.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      By {resource.uploadedBy?.name || 'Unknown'}
                    </span>
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {studyMaterials.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resources yet</h3>
                <p className="text-gray-500">
                  {community.isModerator 
                    ? 'Upload career resources like resume templates, interview guides, etc.'
                    : 'Alumni will share career resources here'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mpeg"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            handleFileUpload(file);
          }
          // Reset input so the same file can be selected again
          e.target.value = '';
        }}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Content</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowUploadModal(false);
                }}
                className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Upload Study Material</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="w-5 h-5 text-green-600" />
                <span>Create Assignment</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Pin className="w-5 h-5 text-yellow-600" />
                <span>Post Announcement</span>
              </button>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDetail;