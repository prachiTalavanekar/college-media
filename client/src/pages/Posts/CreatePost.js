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
  Plus
} from 'lucide-react';

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'post';

  const [formData, setFormData] = useState({
    content: '',
    postType: initialType === 'photo' ? 'community_post' : initialType,
    targetAudience: {
      departments: [],
      courses: [],
      batches: [],
      roles: []
    },
    community: '',
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

  const postTypes = [
    { value: 'community_post', label: 'Community Post', description: 'Share thoughts with your community' },
    { value: 'blog', label: 'Blog Post', description: 'Write a detailed article' },
    { value: 'opportunity', label: 'Opportunity', description: 'Share job/internship opportunities' }
  ];

  // Add announcement for eligible users
  if (['teacher', 'principal', 'admin'].includes(user?.role)) {
    postTypes.unshift({
      value: 'announcement',
      label: 'Announcement',
      description: 'Official college announcement'
    });
  }

  const departments = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
  const courses = ['All', 'B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA'];
  const roles = ['all', 'student', 'alumni', 'teacher'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('media', file);
        
        const response = await api.post('/posts/upload-media', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        return {
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: response.data.url,
          publicId: response.data.publicId
        };
      });
      
      const uploadedMedia = await Promise.all(uploadPromises);
      setMedia(prev => [...prev, ...uploadedMedia]);
      
      toast.success(`${uploadedMedia.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Media upload error:', error);
      toast.error('Failed to upload media files');
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

    // Validate opportunity details if it's an opportunity post
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

    setLoading(true);

    try {
      const postData = {
        content: formData.content.trim(),
        postType: formData.postType,
        targetAudience: formData.targetAudience,
        media: media,
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
      
      // Navigate back to home feed
      navigate('/');
    } catch (error) {
      console.error('Create post error:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error('Failed to create post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 w-full mobile-overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-4 py-3 sticky top-0 z-10 w-full shadow-sm">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Post</h1>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.content.trim()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl hover:scale-105 text-sm md:text-base"
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

      <div className="w-full mobile-content md:px-6 md:py-6 space-y-5">
        <form onSubmit={handleSubmit} className="mobile-space-y-4 md:space-y-6 w-full animate-fadeIn">
          {/* Post Type Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100 w-full hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mobile-text-base">Choose Post Type</h3>
            </div>
            <div className="mobile-grid md:grid md:grid-cols-2 gap-3">
              {postTypes.map(type => (
                <label key={type.value} className="relative group cursor-pointer">
                  <input
                    type="radio"
                    name="postType"
                    value={type.value}
                    checked={formData.postType === type.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-xl border-2 transition-all duration-300 min-h-[80px] flex flex-col justify-center ${
                    formData.postType === type.value
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md scale-105'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                  }`}>
                    <div className="font-semibold text-gray-900 mb-1 mobile-text-base flex items-center gap-2">
                      {formData.postType === type.value && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                      {type.label}
                    </div>
                    <div className="mobile-text-sm text-gray-600">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100 w-full hover:shadow-xl transition-all duration-300">
            <div className="flex items-start space-x-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-blue-100">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mobile-text-base">{user?.name}</div>
                <div className="mobile-text-sm text-gray-500 flex items-center gap-1">
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
              className="w-full border-none resize-none focus:outline-none text-base md:text-lg placeholder-gray-400 min-h-[140px] md:min-h-auto bg-transparent"
              rows={6}
              maxLength={2000}
            />
            
            {/* Character Counter */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span className={`font-medium ${formData.content.length > 1800 ? 'text-orange-500' : ''} ${formData.content.length >= 2000 ? 'text-red-500' : ''}`}>
                {formData.content.length} / 2000 characters
              </span>
              {formData.content.length > 0 && (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Draft saved
                </span>
              )}
            </div>

            {/* Media Preview */}
            {media.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                {media.map((item, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                    {item.type === 'image' ? (
                      <img 
                        src={item.url} 
                        alt="Upload preview"
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <video 
                        src={item.url}
                        className="w-full h-40 object-cover"
                        controls
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Media Upload */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 overflow-x-auto">
              <label className="flex items-center gap-2 px-4 py-2.5 text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition-all duration-200 min-h-[44px] whitespace-nowrap border border-blue-200 hover:border-blue-300 hover:shadow-md">
                <Image size={20} />
                <span className="mobile-text-sm font-medium">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMediaUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              
              <label className="flex items-center gap-2 px-4 py-2.5 text-purple-600 hover:bg-purple-50 rounded-xl cursor-pointer transition-all duration-200 min-h-[44px] whitespace-nowrap border border-purple-200 hover:border-purple-300 hover:shadow-md">
                <Video size={20} />
                <span className="mobile-text-sm font-medium">Add Video</span>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleMediaUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>

              {/* Quick Emoji Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex items-center gap-2 px-4 py-2.5 text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200 min-h-[44px] whitespace-nowrap border border-yellow-200 hover:border-yellow-300 hover:shadow-md"
                >
                  <span className="text-xl">😊</span>
                  <span className="mobile-text-sm font-medium">Emoji</span>
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-10 animate-scaleIn">
                    <div className="flex gap-2 flex-wrap max-w-[200px]">
                      {quickEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="text-2xl hover:scale-125 transition-transform duration-200 w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg"
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

          {/* Opportunity Details */}
          {formData.postType === 'opportunity' && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-sm rounded-2xl p-5 shadow-lg border-2 border-green-200 w-full hover:shadow-xl transition-all duration-300 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-green-900 mobile-text-base">Opportunity Details</h3>
              </div>
              
              <div className="mobile-grid md:grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mobile-text-sm font-semibold text-green-800 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.opportunityDetails.title}
                    onChange={(e) => handleOpportunityChange('title', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                    placeholder="e.g., Software Engineer"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mobile-text-sm font-semibold text-green-800 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={formData.opportunityDetails.company}
                    onChange={(e) => handleOpportunityChange('company', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                    placeholder="e.g., Google"
                    required
                  />
                </div>
              </div>

              <div className="mobile-grid md:grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block mobile-text-sm font-semibold text-green-800 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.opportunityDetails.location}
                    onChange={(e) => handleOpportunityChange('location', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                    placeholder="e.g., Bangalore"
                  />
                </div>
                
                <div>
                  <label className="block mobile-text-sm font-semibold text-green-800 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.opportunityDetails.type}
                    onChange={(e) => handleOpportunityChange('type', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                  >
                    <option value="job">Full-time Job</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                    <option value="project">Project</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mobile-text-sm font-semibold text-green-800 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.opportunityDetails.applicationDeadline}
                    onChange={(e) => handleOpportunityChange('applicationDeadline', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                  />
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-4">
                <label className="block mobile-text-sm font-semibold text-green-800 mb-2">
                  Requirements
                </label>
                {formData.opportunityDetails.requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                      placeholder="e.g., 3+ years experience in React"
                    />
                    {formData.opportunityDetails.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center border-2 border-red-200 hover:border-red-300 transition-all"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  className="flex items-center gap-2 text-green-700 hover:text-green-800 mobile-text-sm font-semibold min-h-[44px] px-4 py-2 bg-green-50 hover:bg-green-100 rounded-xl transition-all border border-green-200"
                >
                  <Plus size={18} />
                  <span>Add Requirement</span>
                </button>
              </div>

              <div className="mobile-grid md:grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mobile-text-sm font-semibold text-green-800 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.opportunityDetails.contactEmail}
                    onChange={(e) => handleOpportunityChange('contactEmail', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                    placeholder="hr@company.com"
                  />
                </div>
                
                <div>
                  <label className="block mobile-text-sm font-semibold text-green-800 mb-2">
                    Application Link
                  </label>
                  <input
                    type="url"
                    value={formData.opportunityDetails.externalLink}
                    onChange={(e) => handleOpportunityChange('externalLink', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                    placeholder="https://company.com/careers"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Target Audience */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100 w-full hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Users size={18} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mobile-text-base">Who can see this post?</h3>
            </div>
            
            {/* Departments */}
            <div className="mb-5">
              <label className="block mobile-text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Departments
              </label>
              <div className="flex flex-wrap gap-2">
                {departments.map(dept => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleAudienceChange('departments', dept)}
                    className={`px-4 py-2.5 rounded-xl mobile-text-sm font-semibold transition-all duration-200 min-h-[44px] shadow-sm hover:shadow-md ${
                      formData.targetAudience.departments.includes(dept)
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white scale-105 shadow-blue-500/30'
                        : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Courses */}
            <div className="mb-5">
              <label className="block mobile-text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Courses
              </label>
              <div className="flex flex-wrap gap-2">
                {courses.map(course => (
                  <button
                    key={course}
                    type="button"
                    onClick={() => handleAudienceChange('courses', course)}
                    className={`px-4 py-2.5 rounded-xl mobile-text-sm font-semibold transition-all duration-200 min-h-[44px] shadow-sm hover:shadow-md ${
                      formData.targetAudience.courses.includes(course)
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white scale-105 shadow-purple-500/30'
                        : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {course}
                  </button>
                ))}
              </div>
            </div>

            {/* Roles */}
            <div>
              <label className="block mobile-text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                Roles
              </label>
              <div className="flex flex-wrap gap-2">
                {roles.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleAudienceChange('roles', role)}
                    className={`px-4 py-2.5 rounded-xl mobile-text-sm font-semibold transition-all duration-200 min-h-[44px] shadow-sm hover:shadow-md ${
                      formData.targetAudience.roles.includes(role)
                        ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white scale-105 shadow-pink-500/30'
                        : 'bg-white text-gray-700 hover:bg-pink-50 border border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    {role === 'all' ? 'Everyone' : role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Helpful Tips Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100 shadow-sm animate-slideIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl">💡</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Tips for a great post</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Be clear and concise in your message</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Add relevant images or videos to engage your audience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 mt-0.5">•</span>
                  <span>Select the right audience to reach the people who matter</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>Use opportunity posts to share job and internship openings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Spacing for Mobile */}
        <div className="h-20 md:h-0"></div>
      </div>
    </div>
  );
};

export default CreatePost;