import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import { 
  ArrowLeft, 
  Image, 
  Video, 
  Users,
  BookOpen,
  X,
  Plus,
  Megaphone,
  Calendar,
  Film,
  BarChart3,
  Star,
  ChevronDown
} from 'lucide-react';

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Determine default post type based on user role
  const getDefaultPostType = () => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'photo') return 'community_post';
    if (typeParam) return typeParam;
    
    // Default based on role
    return ['teacher', 'principal', 'admin'].includes(user?.role) 
      ? 'announcement' 
      : 'community_post';
  };

  const [formData, setFormData] = useState({
    content: '',
    postType: getDefaultPostType(),
    isImportant: false,
    targetAudience: {
      departments: [],
      courses: [],
      batches: [],
      roles: []
    },
    community: '',
    // Event specific fields
    eventDetails: {
      title: '',
      date: '',
      time: '',
      location: '',
      registrationLink: ''
    },
    // Poll specific fields
    pollDetails: {
      question: '',
      options: ['', ''],
      duration: 7 // days
    },
    // Opportunity fields
    opportunityDetails: {
      title: '',
      company: '',
      location: '',
      type: 'job',
      applicationDeadline: '',
      requirements: [''],
      contactEmail: '',
      externalLink: ''
    }
  });
  
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const quickEmojis = ['😊', '🎉', '💡', '🚀', '💼', '📚', '🎓', '👍', '❤️', '🔥'];

  // Post types for teachers
  const teacherPostTypes = [
    { value: 'announcement', label: 'Announcement', icon: Megaphone, description: 'Official college announcement', color: 'red' },
    { value: 'blog', label: 'Blog Post', icon: BookOpen, description: 'Write a detailed article', color: 'blue' },
    { value: 'event', label: 'Event', icon: Calendar, description: 'Create an event', color: 'purple' },
    { value: 'reel', label: 'Reel', icon: Film, description: 'Share a short video', color: 'pink' },
    { value: 'poll', label: 'Poll', icon: BarChart3, description: 'Create a poll', color: 'green' }
  ];

  // Post types for students
  const studentPostTypes = [
    { value: 'community_post', label: 'Community Post', icon: Users, description: 'Share thoughts with your community', color: 'blue' },
    { value: 'blog', label: 'Blog Post', icon: BookOpen, description: 'Write a detailed article', color: 'blue' },
    { value: 'opportunity', label: 'Opportunity', icon: Users, description: 'Share job/internship opportunities', color: 'green' }
  ];

  const postTypes = ['teacher', 'principal', 'admin'].includes(user?.role) ? teacherPostTypes : studentPostTypes;

  const departments = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
  const courses = ['All', 'B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA'];
  const roles = ['all', 'student', 'alumni', 'teacher'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addEmoji = (emoji) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + emoji
    }));
    setShowEmojiPicker(false);
  };

  const handleAudienceChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        [category]: prev.targetAudience[category].includes(value)
          ? prev.targetAudience[category].filter(item => item !== value)
          : [...prev.targetAudience[category], value]
      }
    }));
  };

  // Event handlers
  const handleEventChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      eventDetails: {
        ...prev.eventDetails,
        [field]: value
      }
    }));
  };

  // Poll handlers
  const handlePollChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      pollDetails: {
        ...prev.pollDetails,
        [field]: value
      }
    }));
  };

  const addPollOption = () => {
    if (formData.pollDetails.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        pollDetails: {
          ...prev.pollDetails,
          options: [...prev.pollDetails.options, '']
        }
      }));
    }
  };

  const updatePollOption = (index, value) => {
    setFormData(prev => ({
      ...prev,
      pollDetails: {
        ...prev.pollDetails,
        options: prev.pollDetails.options.map((opt, i) => i === index ? value : opt)
      }
    }));
  };

  const removePollOption = (index) => {
    if (formData.pollDetails.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        pollDetails: {
          ...prev.pollDetails,
          options: prev.pollDetails.options.filter((_, i) => i !== index)
        }
      }));
    }
  };

  // Opportunity handlers
  const handleOpportunityChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      opportunityDetails: {
        ...prev.opportunityDetails,
        [field]: value
      }
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      opportunityDetails: {
        ...prev.opportunityDetails,
        requirements: [...prev.opportunityDetails.requirements, '']
      }
    }));
  };

  const updateRequirement = (index, value) => {
    setFormData(prev => ({
      ...prev,
      opportunityDetails: {
        ...prev.opportunityDetails,
        requirements: prev.opportunityDetails.requirements.map((req, i) => 
          i === index ? value : req
        )
      }
    }));
  };

  const removeRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      opportunityDetails: {
        ...prev.opportunityDetails,
        requirements: prev.opportunityDetails.requirements.filter((_, i) => i !== index)
      }
    }));
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const invalidFiles = files.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      toast.error('Some files are too large. Maximum size is 10MB per file.');
      return;
    }
    
    setLoading(true);
    toast.loading('Uploading media...', { id: 'upload' });
    
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('media', file);
        
        const response = await api.post('/posts/upload-media', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000 // 60 seconds for file uploads
        });
        
        return {
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: response.data.url,
          publicId: response.data.publicId
        };
      });
      
      const uploadedMedia = await Promise.all(uploadPromises);
      setMedia(prev => [...prev, ...uploadedMedia]);
      
      toast.success(`${uploadedMedia.length} file(s) uploaded successfully`, { id: 'upload' });
    } catch (error) {
      console.error('Media upload error:', error);
      
      let errorMessage = 'Failed to upload media files';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload timeout. Please try with a smaller file or check your internet connection.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check if the backend server is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, { id: 'upload' });
    } finally {
      setLoading(false);
    }
  };

  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast.error('Please write something to post');
      return;
    }

    // Validate based on post type
    if (formData.postType === 'event') {
      if (!formData.eventDetails.title.trim()) {
        toast.error('Event title is required');
        return;
      }
      if (!formData.eventDetails.date) {
        toast.error('Event date is required');
        return;
      }
    }

    if (formData.postType === 'poll') {
      if (!formData.pollDetails.question.trim()) {
        toast.error('Poll question is required');
        return;
      }
      const validOptions = formData.pollDetails.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast.error('Poll must have at least 2 options');
        return;
      }
    }

    if (formData.postType === 'opportunity') {
      if (!formData.opportunityDetails.title.trim()) {
        toast.error('Job title is required for opportunity posts');
        return;
      }
      if (!formData.opportunityDetails.company.trim()) {
        toast.error('Company name is required for opportunity posts');
        return;
      }
    }

    if (formData.postType === 'reel' && media.length === 0) {
      toast.error('Please upload a video for reel');
      return;
    }

    setLoading(true);

    try {
      const postData = {
        content: formData.content.trim(),
        postType: formData.postType,
        isImportant: formData.isImportant,
        targetAudience: formData.targetAudience,
        media: media,
        ...(formData.postType === 'event' && {
          eventDetails: formData.eventDetails
        }),
        ...(formData.postType === 'poll' && {
          pollDetails: {
            ...formData.pollDetails,
            options: formData.pollDetails.options.filter(opt => opt.trim())
          }
        }),
        ...(formData.postType === 'opportunity' && {
          opportunityDetails: {
            ...formData.opportunityDetails,
            requirements: formData.opportunityDetails.requirements.filter(req => req.trim())
          }
        }),
        ...(formData.community && { community: formData.community })
      };

      console.log('Creating post with data:', postData);

      const response = await api.post('/posts', postData);
      
      if (response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Post created successfully!');
      }
      
      navigate('/');
    } catch (error) {
      console.error('Create post error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg || err.message).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error('Failed to create post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (color) => {
    const colors = {
      red: 'from-red-500 to-red-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      pink: 'from-pink-500 to-pink-600',
      green: 'from-green-500 to-green-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full mobile-overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 w-full shadow-sm">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Create Post</h1>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.content.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm md:text-base"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Posting...
              </span>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </div>

      <div className="w-full py-4 pb-24 mobile-content space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          {/* Post Type Dropdown for Teachers */}
          {['teacher', 'principal', 'admin'].includes(user?.role) && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Post Type
              </label>
              <div className="relative">
                <select
                  name="postType"
                  value={formData.postType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none text-base font-medium"
                >
                  {postTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
              
              {/* Mark as Important Checkbox */}
              <label className="flex items-center space-x-3 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl cursor-pointer hover:bg-yellow-100 transition-colors">
                <input
                  type="checkbox"
                  name="isImportant"
                  checked={formData.isImportant}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" fill="currentColor" />
                  <span className="text-sm font-semibold text-yellow-900">Mark as Important / Highlight</span>
                </div>
              </label>
            </div>
          )}

          {/* Post Type Selection for Students */}
          {!['teacher', 'principal', 'admin'].includes(user?.role) && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 w-full">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">Choose Post Type</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {postTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <label key={type.value} className="relative group cursor-pointer">
                      <input
                        type="radio"
                        name="postType"
                        value={type.value}
                        checked={formData.postType === type.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                        formData.postType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}>
                        <Icon size={20} className={formData.postType === type.value ? 'text-blue-600' : 'text-gray-600'} />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">{type.label}</div>
                          <div className="text-xs text-gray-600">{type.description}</div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 w-full">
            <div className="flex items-start space-x-3 mb-3 pb-3 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-bold text-lg">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm">{user?.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span>{user?.department}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}? ✨`}
              className="w-full border-none resize-none focus:outline-none text-base placeholder-gray-400 min-h-[120px] bg-transparent"
              rows={5}
              maxLength={2000}
            />
            
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span className={formData.content.length > 1800 ? 'text-orange-500' : ''}>
                {formData.content.length} / 2000
              </span>
            </div>

            {/* Media Preview */}
            {media.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {media.map((item, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden">
                    {item.type === 'image' ? (
                      <img 
                        src={item.url} 
                        alt="Upload"
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <video 
                        src={item.url}
                        className="w-full h-32 object-cover"
                        controls
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Media Upload */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 overflow-x-auto">
              <label className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition-all text-sm border border-blue-200">
                <Image size={18} />
                <span>Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMediaUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              
              <label className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-xl cursor-pointer transition-all text-sm border border-purple-200">
                <Video size={18} />
                <span>Video</span>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleMediaUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex items-center gap-2 px-3 py-2 text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all text-sm border border-yellow-200"
                >
                  <span className="text-lg">😊</span>
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-10">
                    <div className="flex gap-1 flex-wrap max-w-[180px]">
                      {quickEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="text-xl hover:scale-125 transition-transform w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Event Details */}
          {formData.postType === 'event' && (
            <div className="bg-purple-50 rounded-2xl p-4 shadow-sm border-2 border-purple-200 w-full">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-purple-600" />
                <h3 className="font-semibold text-purple-900">Event Details</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-purple-800 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.eventDetails.title}
                    onChange={(e) => handleEventChange('title', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    placeholder="e.g., Tech Fest 2024"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-purple-800 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.eventDetails.date}
                      onChange={(e) => handleEventChange('date', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-purple-800 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.eventDetails.time}
                      onChange={(e) => handleEventChange('time', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-800 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.eventDetails.location}
                    onChange={(e) => handleEventChange('location', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    placeholder="e.g., Main Auditorium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-800 mb-1">
                    Registration Link
                  </label>
                  <input
                    type="url"
                    value={formData.eventDetails.registrationLink}
                    onChange={(e) => handleEventChange('registrationLink', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Poll Details */}
          {formData.postType === 'poll' && (
            <div className="bg-green-50 rounded-2xl p-4 shadow-sm border-2 border-green-200 w-full">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={18} className="text-green-600" />
                <h3 className="font-semibold text-green-900">Poll Details</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-1">
                    Poll Question *
                  </label>
                  <input
                    type="text"
                    value={formData.pollDetails.question}
                    onChange={(e) => handlePollChange('question', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    placeholder="Ask a question..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Options (min 2, max 6)
                  </label>
                  {formData.pollDetails.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        placeholder={`Option ${index + 1}`}
                      />
                      {formData.pollDetails.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl border-2 border-red-200"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.pollDetails.options.length < 6 && (
                    <button
                      type="button"
                      onClick={addPollOption}
                      className="flex items-center gap-2 text-green-700 text-sm font-semibold px-4 py-2 bg-green-100 hover:bg-green-200 rounded-xl transition-all"
                    >
                      <Plus size={18} />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-1">
                    Poll Duration (days)
                  </label>
                  <select
                    value={formData.pollDetails.duration}
                    onChange={(e) => handlePollChange('duration', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value={1}>1 day</option>
                    <option value={3}>3 days</option>
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Opportunity Details */}
          {formData.postType === 'opportunity' && (
            <div className="bg-blue-50 rounded-2xl p-4 shadow-sm border-2 border-blue-200 w-full">
              <div className="flex items-center gap-2 mb-3">
                <Users size={18} className="text-blue-600" />
                <h3 className="font-semibold text-blue-900">Opportunity Details</h3>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-blue-800 mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={formData.opportunityDetails.title}
                      onChange={(e) => handleOpportunityChange('title', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="e.g., Software Engineer"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-blue-800 mb-1">
                      Company *
                    </label>
                    <input
                      type="text"
                      value={formData.opportunityDetails.company}
                      onChange={(e) => handleOpportunityChange('company', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="e.g., Google"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-blue-800 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.opportunityDetails.location}
                      onChange={(e) => handleOpportunityChange('location', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="Bangalore"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-blue-800 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.opportunityDetails.type}
                      onChange={(e) => handleOpportunityChange('type', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="job">Full-time</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-blue-800 mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.opportunityDetails.applicationDeadline}
                      onChange={(e) => handleOpportunityChange('applicationDeadline', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-800 mb-2">
                    Requirements
                  </label>
                  {formData.opportunityDetails.requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="e.g., 3+ years in React"
                      />
                      {formData.opportunityDetails.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl border-2 border-red-200"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="flex items-center gap-2 text-blue-700 text-sm font-semibold px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all"
                  >
                    <Plus size={18} />
                    <span>Add Requirement</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-blue-800 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.opportunityDetails.contactEmail}
                      onChange={(e) => handleOpportunityChange('contactEmail', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="hr@company.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-blue-800 mb-1">
                      Application Link
                    </label>
                    <input
                      type="url"
                      value={formData.opportunityDetails.externalLink}
                      onChange={(e) => handleOpportunityChange('externalLink', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Target Audience */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 w-full">
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-gray-700" />
              <h3 className="font-semibold text-gray-900">Who can see this?</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Departments
                </label>
                <div className="flex flex-wrap gap-2">
                  {departments.map(dept => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => handleAudienceChange('departments', dept)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.targetAudience.departments.includes(dept)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Courses
                </label>
                <div className="flex flex-wrap gap-2">
                  {courses.map(course => (
                    <button
                      key={course}
                      type="button"
                      onClick={() => handleAudienceChange('courses', course)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.targetAudience.courses.includes(course)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {course}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {roles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleAudienceChange('roles', role)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.targetAudience.roles.includes(role)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {role === 'all' ? 'Everyone' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
