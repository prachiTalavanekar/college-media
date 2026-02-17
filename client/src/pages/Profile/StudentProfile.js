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
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all"
          >
            Connect
          </button>
        );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
            className="text-blue-600 hover:text-blue-700"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  const { user, posts, stats } = profileData;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">{stats?.postCount || 0} posts</p>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        {/* Profile Picture */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
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

      {/* Profile Info */}
      <div className="mt-20 px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {user.name}
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(user.role)}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            {user.verificationStatus === 'verified' && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-2">
            <GraduationCap size={16} />
            <span>{user.course || 'Other'} • {user.department || 'Computer Science'}</span>
          </div>

          {user.batch && (
            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-2">
              <Calendar size={16} />
              <span>Batch {user.batch}</span>
            </div>
          )}

          {user.currentCompany && (
            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-2">
              <Building2 size={16} />
              <span>{user.jobTitle} at {user.currentCompany}</span>
            </div>
          )}

          {user.location && (
            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
              <MapPin size={16} />
              <span>{user.location}</span>
            </div>
          )}
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
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats?.postCount || 0}</div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats?.connectionsCount || 0}</div>
            <div className="text-sm text-gray-500">Connections</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats?.communitiesCount || 0}</div>
            <div className="text-sm text-gray-500">Communities</div>
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
                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
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
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">About</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Department</p>
                <p className="text-gray-900 font-medium">{user.department || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Course</p>
                <p className="text-gray-900 font-medium">{user.course || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Batch</p>
                <p className="text-gray-900 font-medium">{user.batch || 'Not specified'}</p>
              </div>
              {user.location && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="text-gray-900 font-medium">{user.location}</p>
                </div>
              )}
              {user.currentCompany && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Current Company</p>
                  <p className="text-gray-900 font-medium">{user.currentCompany}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
