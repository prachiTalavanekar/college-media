import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Plus, 
  Users, 
  BookOpen, 
  Calendar, 
  Briefcase,
  Trophy,
  Hash,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Settings,
  Eye
} from 'lucide-react';
import CreateCommunityModal from '../../components/Communities/CreateCommunityModal';
import CommunityManagement from '../../components/Communities/CommunityManagement';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const Communities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManagement, setShowManagement] = useState(null);

  useEffect(() => {
    fetchCommunities();
  }, [selectedFilter, searchQuery]);

  // Add a refresh function that can be called after approval
  const refreshCommunities = () => {
    fetchCommunities();
  };

  // Expose refresh function globally for debugging
  window.refreshCommunities = refreshCommunities;
  
  // Also add a debug function to check community access
  window.debugCommunityAccess = async (communityId) => {
    try {
      const response = await api.get(`/communities/${communityId}/debug-access`);
      console.log('Debug Community Access:', response.data.debug);
      return response.data.debug;
    } catch (error) {
      console.error('Debug access error:', error);
      return null;
    }
  };

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/communities', {
        params: {
          type: selectedFilter,
          search: searchQuery
        }
      });
      
      console.log('Communities API Response:', response.data); // Debug log
      console.log('Communities with status:', response.data.communities.map(c => ({
        name: c.name,
        isMember: c.isMember,
        canAccessContent: c.canAccessContent,
        hasPendingRequest: c.hasPendingRequest
      }))); // Debug log
      
      setCommunities(response.data.communities);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      await api.post(`/communities/${communityId}/join`);
      toast.success('Successfully joined community');
      fetchCommunities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join community');
    }
  };

  const handleLeaveCommunity = async (communityId) => {
    try {
      await api.post(`/communities/${communityId}/leave`);
      toast.success('Successfully left community');
      fetchCommunities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave community');
    }
  };

  const handleCommunityClick = (community) => {
    console.log('Community click - Access flags:', {
      isMember: community.isMember,
      isModerator: community.isModerator,
      canAccessContent: community.canAccessContent,
      hasPendingRequest: community.hasPendingRequest
    });
    
    // Allow access if user is a member or moderator
    if (community.isMember || community.isModerator) {
      console.log('Access granted - navigating to community');
      navigate(`/communities/${community._id}`);
    } else if (community.hasPendingRequest) {
      toast('Your join request is pending approval', {
        icon: '⏳',
        style: {
          background: '#fef3c7',
          color: '#92400e',
        },
      });
    } else if (community.canJoin) {
      toast('Click Join to request access to this community', {
        icon: 'ℹ️',
        style: {
          background: '#dbeafe',
          color: '#1e40af',
        },
      });
    } else {
      toast.error('You are not eligible to join this community');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const communityTypes = [
    { id: 'all', label: 'All', icon: Hash },
    { id: 'department', label: 'Departments', icon: BookOpen },
    { id: 'subject', label: 'Subjects', icon: BookOpen },
    { id: 'batch', label: 'Batches', icon: Calendar },
    { id: 'project', label: 'Projects', icon: Trophy },
    { id: 'club', label: 'Clubs', icon: Trophy },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'events', label: 'Events', icon: Calendar }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'department': return BookOpen;
      case 'subject': return BookOpen;
      case 'batch': return Calendar;
      case 'project': return Trophy;
      case 'club': return Trophy;
      case 'opportunities': return Briefcase;
      case 'events': return Calendar;
      default: return Users;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'department': return 'from-blue-500 to-blue-600';
      case 'subject': return 'from-indigo-500 to-indigo-600';
      case 'batch': return 'from-purple-500 to-purple-600';
      case 'project': return 'from-orange-500 to-orange-600';
      case 'club': return 'from-pink-500 to-pink-600';
      case 'opportunities': return 'from-green-500 to-green-600';
      case 'events': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'department': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'subject': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'batch': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'project': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'club': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'opportunities': return 'bg-green-100 text-green-700 border-green-200';
      case 'events': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || community.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const joinedCommunities = filteredCommunities.filter(c => c.isMember);
  const availableCommunities = filteredCommunities.filter(c => !c.isMember);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 w-full mobile-overflow-hidden">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-6 md:py-8 w-full page-header shadow-lg">
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Communities</h1>
              <p className="text-blue-100 text-sm md:text-base">Connect, collaborate, and grow together</p>
            </div>
            {['teacher', 'principal', 'admin'].includes(user?.role) && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 shadow-lg transition-all hover:scale-105"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Create</span>
              </button>
            )}
            
            {/* Debug refresh button - remove in production */}
            <button 
              onClick={refreshCommunities}
              className="bg-white bg-opacity-20 text-white hover:bg-opacity-30 px-3 py-2 rounded-xl font-semibold text-sm transition-all"
              title="Refresh Communities"
            >
              🔄
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-0 rounded-xl shadow-md focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-3 overflow-x-auto pb-2 mobile-tabs hide-scrollbar">
            {communityTypes.map((type) => {
              const Icon = type.icon;
              const isActive = selectedFilter === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedFilter(type.id)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-lg'
                      : 'bg-white bg-opacity-15 backdrop-blur-sm text-white hover:bg-opacity-25 border border-white border-opacity-20'
                  }`}
                >
                  <Icon size={16} strokeWidth={2} />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full py-4 pb-24 mobile-content">
        {/* My Communities */}
        {joinedCommunities.length > 0 && (
          <div className="w-full mb-6">
            <div className="flex items-center space-x-2 mb-3 px-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-base md:text-lg font-semibold text-gray-900">My Communities</h2>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                {joinedCommunities.length}
              </span>
            </div>
            <div className="space-y-0 w-full">
              {joinedCommunities.map(community => (
                <CommunityCard 
                  key={community._id} 
                  community={community} 
                  isJoined={true}
                  onJoin={handleJoinCommunity}
                  onLeave={handleLeaveCommunity}
                  onManage={setShowManagement}
                  onCommunityClick={handleCommunityClick}
                  currentUser={user}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Communities */}
        {availableCommunities.length > 0 && (
          <div className="w-full">
            <div className="flex items-center space-x-2 mb-3 px-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                {joinedCommunities.length > 0 ? 'Discover More' : 'All Communities'}
              </h2>
            </div>
            <div className="space-y-0 w-full">
              {availableCommunities.map(community => (
                <CommunityCard 
                  key={community._id} 
                  community={community} 
                  isJoined={false}
                  onJoin={handleJoinCommunity}
                  onLeave={handleLeaveCommunity}
                  onManage={setShowManagement}
                  onCommunityClick={handleCommunityClick}
                  currentUser={user}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredCommunities.length === 0 && (
          <div className="text-center py-12 md:py-16 w-full">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-500 px-4 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCommunityModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCommunityCreated={(newCommunity) => {
            setCommunities(prev => [newCommunity, ...prev]);
          }}
        />
      )}

      {showManagement && (
        <CommunityManagement
          communityId={showManagement}
          onClose={() => setShowManagement(null)}
        />
      )}
    </div>
  );
};

const CommunityCard = ({ community, isJoined, onJoin, onLeave, onManage, onCommunityClick, currentUser }) => {
  const [actionLoading, setActionLoading] = useState(false);
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'department': return BookOpen;
      case 'subject': return BookOpen;
      case 'batch': return Calendar;
      case 'project': return Trophy;
      case 'club': return Trophy;
      case 'opportunities': return Briefcase;
      case 'events': return Calendar;
      default: return Users;
    }
  };
  
  const TypeIcon = getTypeIcon(community.type);

  const handleAction = async () => {
    if (actionLoading) return;
    
    setActionLoading(true);
    try {
      if (isJoined) {
        await onLeave(community._id);
      } else {
        await onJoin(community._id);
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Check if user has a pending join request
  const hasPendingRequest = community.hasPendingRequest;

  const formatLastActivity = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `Active ${diffInHours}h ago`;
    if (diffInHours < 168) return `Active ${Math.floor(diffInHours / 24)}d ago`;
    return `Active ${activityDate.toLocaleDateString()}`;
  };

  const canManage = community.isModerator || 
                   (currentUser && ['teacher', 'principal', 'admin'].includes(currentUser.role) && 
                    (community.creator === currentUser.id || community.isModerator));

  return (
    <div className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
      <div 
        className="px-4 py-4 cursor-pointer"
        onClick={() => onCommunityClick && onCommunityClick(community)}
      >
        <div className="flex items-start space-x-3 mb-2">
          {/* Icon */}
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {community.coverImage ? (
              <img 
                src={community.coverImage} 
                alt={community.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <TypeIcon className="w-6 h-6 text-gray-600" />
            )}
          </div>

          {/* Title and Badge */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
              {community.name}
            </h3>
            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
              {community.type}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {community.description}
        </p>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-1">
            <Users size={14} />
            <span>{community.memberCount || community.stats?.totalMembers || 0} members</span>
          </div>
          <div className="flex items-center space-x-1">
            <Hash size={14} />
            <span>{community.stats?.totalPosts || 0} posts</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp size={14} />
            <span>{community.stats?.activeMembers || 0} active</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock size={12} />
            <span>{formatLastActivity(community.stats?.lastActivity || community.createdAt)}</span>
          </div>

          <div className="flex items-center space-x-2">
            {canManage && isJoined && (
              <button
                onClick={() => onManage(community._id)}
                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Manage Community"
              >
                <Settings size={16} />
              </button>
            )}
            
            <button
              onClick={handleAction}
              disabled={actionLoading || hasPendingRequest}
              className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${
                isJoined
                  ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                  : hasPendingRequest
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {actionLoading ? (
                <div className="loading-spinner h-4 w-4"></div>
              ) : isJoined ? (
                'Joined'
              ) : hasPendingRequest ? (
                'Pending'
              ) : (
                'Join'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communities;
