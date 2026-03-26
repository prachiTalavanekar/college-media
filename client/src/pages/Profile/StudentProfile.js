import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft,
  Mail, 
  Calendar, 
  MapPin, 
  GraduationCap,
  Building2,
  Grid,
  User as UserIcon,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';
import AboutSection from '../../components/Profile/AboutSection';

const StudentProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [connectionLoading, setConnectionLoading] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchUserProfile();
    if (!isOwnProfile) {
      fetchConnectionStatus();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/profile/user/${userId}`);
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.response?.data?.message || 'Failed to load profile');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionStatus = async () => {
    try {
      const response = await api.get(`/connections/status/${userId}`);
      setConnectionStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching connection status:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setConnectionLoading(true);
      await api.post(`/connections/request/${userId}`);
      setConnectionStatus('pending');
      toast.success('Connection request sent!');
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error(error.response?.data?.message || 'Failed to send connection request');
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleAcceptConnection = async () => {
    try {
      setConnectionLoading(true);
      await api.post(`/connections/accept/${userId}`);
      setConnectionStatus('connected');
      toast.success('Connection accepted!');
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast.error(error.response?.data?.message || 'Failed to accept connection');
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleRemoveConnection = async () => {
    try {
      setConnectionLoading(true);
      await api.delete(`/connections/remove/${userId}`);
      setConnectionStatus('none');
      toast.success('Connection removed');
    } catch (error) {
      console.error('Error removing connection:', error);
      toast.error(error.response?.data?.message || 'Failed to remove connection');
    } finally {
      setConnectionLoading(false);
    }
  };

  const getConnectionButton = () => {
    if (connectionLoading) {
      return (
        <button disabled className="flex-1 bg-gray-400 text-white font-semibold py-3 rounded-xl shadow-lg cursor-not-allowed">
          Loading...
        </button>
      );
    }

    switch (connectionStatus) {
      case 'connected':
        return (
          <button 
            onClick={handleRemoveConnection}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl shadow-lg transition-all"
          >
            Connected
          </button>
        );
      case 'pending':
        return (
          <button disabled className="flex-1 bg-gray-400 text-white font-semibold py-3 rounded-xl shadow-lg cursor-not-allowed">
            Request Sent
          </button>
        );
      case 'received':
        return (
          <button 
            onClick={handleAcceptConnection}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all"
          >
            Accept Request
          </button>
        );
      default:
        return (
          <button 
            onClick={handleConnect}
            className="flex-1 bg-oxford-blue-600 hover:bg-oxford-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all"
          >
            Connect
          </button>
        );
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'principal': return 'bg-gradient-to-r from-oxford-blue-500 to-oxford-blue-600 text-white';
      case 'teacher': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'alumni': return 'bg-gradient-to-r from-tan-500 to-tan-600 text-white';
      default: return 'bg-gradient-to-r from-oxford-blue-500 to-oxford-blue-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-oxford-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-oxford-blue-600 hover:text-oxford-blue-700"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  const { user, posts, stats } = profileData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">{stats?.postCount || 0} posts</p>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-oxford-blue-900 via-oxford-blue-800 to-oxford-blue-700 relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-5 right-10 w-32 h-32 bg-tan-400 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-3 left-10 w-24 h-24 bg-tan-300 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Profile Picture */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-tan-400 to-tan-600 rounded-full blur-xl opacity-40 animate-pulse"></div>
            
            <div className="relative w-32 h-32 rounded-full bg-white p-1.5 shadow-2xl">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-oxford-blue-600 to-oxford-blue-500 flex items-center justify-center overflow-hidden ring-4 ring-white">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-4xl">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-20 px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {user.name}
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-md ${getRoleBadgeColor(user.role)}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            {user.verificationStatus === 'verified' && (
              <span className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-full shadow-md flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-gray-700 text-sm">
              <GraduationCap size={16} className="text-oxford-blue-600" />
              <span className="font-medium">{user.course || 'Other'} • {user.department || 'Computer Science'}</span>
            </div>

            {user.batch && (
              <div className="flex items-center justify-center gap-2 text-gray-700 text-sm">
                <Calendar size={16} className="text-tan-600" />
                <span className="font-medium">Batch {user.batch}</span>
              </div>
            )}

            {user.currentCompany && (
              <div className="flex items-center justify-center gap-2 text-gray-700 text-sm">
                <Building2 size={16} className="text-oxford-blue-600" />
                <span className="font-medium">{user.jobTitle} at {user.currentCompany}</span>
              </div>
            )}

            {user.location && (
              <div className="flex items-center justify-center gap-2 text-gray-700 text-sm">
                <MapPin size={16} className="text-tan-600" />
                <span className="font-medium">{user.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <p className="text-gray-700">{user.bio}</p>
          </div>
        )}

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="flex gap-3 mb-6">
            {getConnectionButton()}
            <button 
              onClick={() => connectionStatus === 'connected' ? navigate(`/messages?userId=${userId}`) : toast.error('You need to be connected to send messages')}
              disabled={connectionStatus !== 'connected'}
              className={`flex-1 font-semibold py-3 rounded-xl border shadow-sm transition-all ${
                connectionStatus === 'connected'
                  ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                  : 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
            >
              Message
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-4 text-center shadow-md hover:shadow-lg transition-all">
            <div className="text-3xl font-black bg-gradient-to-br from-oxford-blue-600 to-oxford-blue-500 bg-clip-text text-transparent mb-1.5">{stats?.postCount || 0}</div>
            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Posts</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-md hover:shadow-lg transition-all">
            <div className="text-3xl font-black bg-gradient-to-br from-oxford-blue-600 to-oxford-blue-500 bg-clip-text text-transparent mb-1.5">{stats?.connectionsCount || 0}</div>
            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Connections</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-md hover:shadow-lg transition-all">
            <div className="text-3xl font-black bg-gradient-to-br from-oxford-blue-600 to-oxford-blue-500 bg-clip-text text-transparent mb-1.5">{stats?.communitiesCount || 0}</div>
            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Communities</div>
          </div>
        </div>

        {/* Contact Info */}
        {user.showContactNumber && user.contactNumber && (
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail size={18} />
              <span className="text-sm">{user.email}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md p-2 mb-4 max-w-md mx-auto">
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
          <div className="space-y-4 max-w-md mx-auto">
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <div key={post._id} className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-gray-800 mb-4">{post.content}</p>
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
                    <button className="flex items-center gap-2 text-gray-600 hover:text-green-600">
                      <Share2 size={18} />
                      <span className="text-sm font-medium">Share</span>
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
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="font-bold text-gray-900 mb-6 text-xl">About</h3>
              <AboutSection userData={user} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
