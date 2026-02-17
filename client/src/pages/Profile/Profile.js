import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { 
  Edit, 
  Mail, 
  Calendar, 
  GraduationCap,
  Grid,
  User as UserIcon,
  Heart,
  MessageCircle
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      console.log('=== Profile.js Debug Start ===');
      console.log('Full user object:', user);
      console.log('user.id:', user?.id);
      console.log('user._id:', user?._id);
      console.log('user.name:', user?.name);
      console.log('user.role:', user?.role);
      console.log('user.email:', user?.email);
      
      // Get user ID - try both id and _id properties
      const userId = user?.id || user?._id;
      
      console.log('Resolved userId:', userId);
      console.log('=== Profile.js Debug End ===');
      
      if (!userId) {
        console.error('Profile.js - No user ID found, redirecting to login');
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        console.log('Profile.js - Fetching profile for user ID:', userId);
        const response = await api.get(`/profile/user/${userId}`);
        console.log('Profile.js - Profile data received for user:', response.data.user?.name);
        console.log('Profile.js - Profile user ID:', response.data.user?.id || response.data.user?._id);
        setProfileData(response.data);
        
        // DO NOT call /auth/me here - it causes the user to switch!
        // The user data from context is already correct from login
        
      } catch (error) {
        console.error('Profile.js - Error fetching profile data:', error);
        console.error('Profile.js - Error response:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProfileData();
    }
  }, [user?.id, user?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = profileData?.stats ? [
    { label: 'Posts', value: profileData.stats.postCount.toString() },
    { label: 'Connections', value: profileData.stats.connectionsCount.toString() },
    { label: 'Communities', value: profileData.stats.communitiesCount.toString() }
  ] : [
    { label: 'Posts', value: '0' },
    { label: 'Connections', value: '0' },
    { label: 'Communities', value: '0' }
  ];

  const userPosts = profileData?.posts || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Cover Image */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-600">
          <button
            onClick={() => navigate('/profile/edit')}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          >
            <Edit size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Profile Picture */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
              {user?.profileImage ? (
                <img 
                  key={user.profileImage}
                  src={user.profileImage} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-4xl">
                  {user?.name?.charAt(0)?.toUpperCase() || 'P'}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/profile/edit')}
              className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700"
            >
              <Edit size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-20 px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {user?.name || 'User'}
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${
              user?.role === 'admin' ? 'bg-red-100 text-red-700' :
              user?.role === 'principal' ? 'bg-indigo-100 text-indigo-700' :
              user?.role === 'teacher' ? 'bg-green-100 text-green-700' :
              user?.role === 'alumni' ? 'bg-purple-100 text-purple-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {user?.role || 'Student'}
            </span>
            {user?.verificationStatus === 'verified' && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-2">
            <GraduationCap size={16} />
            <span>{user?.course || 'Other'} • {user?.department || 'Computer Science'}</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
            <Calendar size={16} />
            <span>Batch {user?.batch || '2023-2026'}</span>
          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/profile/edit')}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Edit size={18} />
            Edit Profile
          </button>
          
          {/* Debug Button - Remove after testing */}
          <button
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log('Current user from context:', user);
              console.log('User ID:', user?.id);
              console.log('User from localStorage:', JSON.parse(localStorage.getItem('user') || '{}'));
              console.log('Profile data:', profileData);
              alert(`User: ${user?.name}\nRole: ${user?.role}\nID: ${user?.id}`);
            }}
            className="w-full mt-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold py-2 rounded-xl text-sm"
          >
            🐛 Debug User Info
          </button>
          
          {/* Force Logout Button */}
          <button
            onClick={() => {
              console.log('=== FORCE LOGOUT ===');
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/login';
            }}
            className="w-full mt-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2 rounded-xl text-sm"
          >
            🚪 Force Logout & Clear All Data
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <Mail size={18} />
            <span className="text-sm">{user?.email || 'No email'}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-4">
          <div className="grid grid-cols-2">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center justify-center gap-2 py-4 font-semibold transition-all ${
                activeTab === 'posts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              <Grid size={18} />
              Posts
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center justify-center gap-2 py-4 font-semibold transition-all ${
                activeTab === 'about'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              <UserIcon size={18} />
              About
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' ? (
          <div className="space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <div key={post._id} className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-gray-800 mb-4">{post.content}</p>
                  {post.media && post.media.length > 0 && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={post.media[0].url} 
                        alt="Post media"
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{post.likes?.length || 0} likes</span>
                    <span>{post.comments?.length || 0} comments</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-red-600">
                      <Heart size={18} />
                      <span className="text-sm font-medium">Like</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                      <MessageCircle size={18} />
                      <span className="text-sm font-medium">Comment</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <Grid className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No posts yet</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">About</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Department</p>
                <p className="text-gray-900 font-medium">{user?.department || 'Computer Science'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Course</p>
                <p className="text-gray-900 font-medium">{user?.course || 'B.Tech'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Batch</p>
                <p className="text-gray-900 font-medium">{user?.batch || '2023-2026'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p className="text-gray-900 font-medium">{user?.location || 'Not specified'}</p>
              </div>
              {user?.bio && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Bio</p>
                  <p className="text-gray-700">{user.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
