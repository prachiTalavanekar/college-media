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
  MessageCircle,
  Edit2
} from 'lucide-react';
import AboutSection from '../../components/Profile/AboutSection';
import EditAboutModal from '../../components/Profile/EditAboutModal';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [showEditAboutModal, setShowEditAboutModal] = useState(false);

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
      console.log('Current pathname:', window.location.pathname);
      
      // Get user ID - try both id and _id properties
      const userId = user?.id || user?._id;
      
      console.log('Resolved userId:', userId);
      console.log('=== Profile.js Debug End ===');
      
      if (!userId) {
        console.error('Profile.js - No user ID found, redirecting to login');
        navigate('/login', { replace: true });
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
        
        // Don't redirect on error, just show error state
        if (error.response?.status === 401) {
          console.log('Profile.js - 401 error, redirecting to login');
          navigate('/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?._id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-oxford-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Modern Cover with Gradient - Reduced Height */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-oxford-blue-900 via-oxford-blue-800 to-oxford-blue-700 relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-5 right-10 w-32 h-32 bg-tan-400 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-3 left-10 w-24 h-24 bg-tan-300 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full blur-xl opacity-30"></div>
          </div>
          
          {/* Edit Button - Top Right */}
          <button
            onClick={() => navigate('/profile/edit')}
            className="absolute top-4 right-4 p-3 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:bg-white hover:scale-105 transition-all"
          >
            <Edit size={20} className="text-oxford-blue-700" />
          </button>
        </div>

        {/* Profile Picture - Adjusted Position */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-20">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-tan-400 to-tan-600 rounded-full blur-xl opacity-40 animate-pulse"></div>
            
            {/* Profile Image Container */}
            <div className="relative w-40 h-40 rounded-full bg-white p-2 shadow-2xl">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-oxford-blue-600 to-oxford-blue-500 flex items-center justify-center overflow-hidden ring-4 ring-white">
                {user?.profileImage ? (
                  <img 
                    key={user.profileImage}
                    src={user.profileImage} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-6xl">
                    {user?.name?.charAt(0)?.toUpperCase() || 'P'}
                  </span>
                )}
              </div>
            </div>
            
            {/* Edit Badge - Better Positioned */}
            <button
              onClick={() => navigate('/profile/edit')}
              className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-br from-tan-500 to-tan-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:scale-110 ring-4 ring-white"
            >
              <Edit size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content - Adjusted Spacing */}
      <div className="mt-24 px-4">
        {/* Name and Role - Centered */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            {user?.name || 'User'}
          </h1>
          
          {/* Badges - Better Spacing */}
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap px-4">
            <span className={`px-5 py-2 text-sm font-bold rounded-full capitalize shadow-md ${
              user?.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
              user?.role === 'principal' ? 'bg-gradient-to-r from-oxford-blue-500 to-oxford-blue-600 text-white' :
              user?.role === 'teacher' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
              user?.role === 'alumni' ? 'bg-gradient-to-r from-tan-500 to-tan-600 text-white' :
              'bg-gradient-to-r from-oxford-blue-500 to-oxford-blue-600 text-white'
            }`}>
              {user?.role || 'Student'}
            </span>
            {user?.verificationStatus === 'verified' && (
              <span className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-full shadow-md flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
          </div>

          {/* Info Cards - Stacked with Icons */}
          <div className="flex flex-col gap-3 max-w-md mx-auto px-4">
            <div className="flex items-center gap-3 text-gray-700 bg-white rounded-2xl px-5 py-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 bg-gradient-to-br from-oxford-blue-500 to-oxford-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="text-xs text-gray-500 font-medium mb-0.5">Course & Department</p>
                <p className="text-sm font-bold text-gray-900">{user?.course || 'Other'} • {user?.department || 'Computer Science'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700 bg-white rounded-2xl px-5 py-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 bg-gradient-to-br from-tan-500 to-tan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar size={20} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="text-xs text-gray-500 font-medium mb-0.5">Batch</p>
                <p className="text-sm font-bold text-gray-900">{user?.batch || '2023-2026'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Button - More Prominent */}
        <div className="mb-8 max-w-md mx-auto px-4">
          <button
            onClick={() => navigate('/profile/edit')}
            className="w-full bg-gradient-to-r from-oxford-blue-600 to-oxford-blue-500 hover:from-oxford-blue-700 hover:to-oxford-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <Edit2 size={20} />
            <span className="text-base">Edit Profile</span>
          </button>
        </div>

        {/* Stats Cards - Compact Design */}
        <div className="grid grid-cols-3 gap-3 mb-8 max-w-md mx-auto px-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 text-center shadow-md hover:shadow-lg transition-all hover:scale-105">
              <div className="text-3xl font-black bg-gradient-to-br from-oxford-blue-600 to-oxford-blue-500 bg-clip-text text-transparent mb-1.5">
                {stat.value}
              </div>
              <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wide leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Contact Info Card - Redesigned */}
        <div className="bg-white rounded-2xl p-5 mb-8 shadow-md hover:shadow-lg transition-shadow max-w-md mx-auto mx-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-oxford-blue-500 to-oxford-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
              <Mail size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Email Address</p>
              <p className="text-sm text-gray-900 font-semibold truncate">{user?.email || 'No email'}</p>
            </div>
          </div>
        </div>

        {/* Tabs - Modern Pill Design */}
        <div className="bg-white rounded-2xl shadow-md p-2 mb-6 max-w-md mx-auto mx-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center justify-center gap-2 py-3.5 font-bold rounded-xl transition-all ${
                activeTab === 'posts'
                  ? 'bg-gradient-to-r from-oxford-blue-600 to-oxford-blue-500 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Grid size={18} />
              <span>Posts</span>
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center justify-center gap-2 py-3.5 font-bold rounded-xl transition-all ${
                activeTab === 'about'
                  ? 'bg-gradient-to-r from-oxford-blue-600 to-oxford-blue-500 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <UserIcon size={18} />
              <span>About</span>
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
                    <button className="flex items-center gap-2 text-gray-600 hover:text-oxford-blue-600">
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
          <div className="max-w-md mx-auto px-4">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-xl">About</h3>
                <button
                  onClick={() => setShowEditAboutModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-oxford-blue-600 text-white rounded-xl hover:bg-oxford-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
              </div>
              <AboutSection userData={profileData?.user || user} />
            </div>
          </div>
        )}
      </div>

      {/* Edit About Modal */}
      {showEditAboutModal && (
        <EditAboutModal
          isOpen={showEditAboutModal}
          onClose={() => setShowEditAboutModal(false)}
          userData={profileData?.user || user}
          onUpdate={(updatedData) => {
            // Update the profile data with new about section
            setProfileData(prev => ({
              ...prev,
              user: {
                ...prev.user,
                about: updatedData.about,
                skills: updatedData.skills
              }
            }));
          }}
        />
      )}
    </div>
  );
};

export default Profile;
