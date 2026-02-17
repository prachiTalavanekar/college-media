import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const EditProfile = () => {
  const { user, updateUser, setUserData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    course: user?.course || '',
    batch: user?.batch || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
    profileImage: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      if (formData.name) formDataToSend.append('name', formData.name);
      if (formData.phone) formDataToSend.append('phone', formData.phone);
      if (formData.location) formDataToSend.append('location', formData.location);
      if (formData.department) formDataToSend.append('department', formData.department);
      if (formData.course) formDataToSend.append('course', formData.course);
      if (formData.batch) formDataToSend.append('batch', formData.batch);
      if (formData.bio) formDataToSend.append('bio', formData.bio);
      
      // Append image file if exists
      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage);
      }

      const response = await api.put('/profile', formDataToSend, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        console.log('Profile update response:', response.data);
        
        // If we have a profile image in the response, update the user context immediately
        if (response.data.user && response.data.user.profileImage) {
          const updatedUserData = response.data.user;
          setUserData(updatedUserData);
          console.log('Updated user context with new profile image:', updatedUserData.profileImage);
        }
        
        toast.success('Profile updated successfully!');
        
        // Also call updateUser to ensure we have the latest data
        try {
          console.log('Calling updateUser to refresh context...');
          await updateUser();
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
        
        navigate('/profile');
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">Edit Profile</h1>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full disabled:opacity-50"
          >
            <Save size={24} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Profile Image */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-4xl">
                    {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 shadow-lg">
                <Camera size={20} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-3">Click camera icon to change photo</p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="your.email@example.com"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+91 1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City, State"
            />
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Academic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course
            </label>
            <select
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Course</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="B.Sc">B.Sc</option>
              <option value="M.Sc">M.Sc</option>
              <option value="BCA">BCA</option>
              <option value="MCA">MCA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch
            </label>
            <input
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2021-2025"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">About</h2>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Tell us about yourself..."
          />
          <p className="text-xs text-gray-500 mt-2">
            {formData.bio?.length || 0}/500 characters
          </p>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
