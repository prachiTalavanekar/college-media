import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';

const Communities = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock communities data
  const mockCommunities = [
    {
      _id: '1',
      name: 'Computer Science Department',
      description: 'Official community for CS students and faculty. Share resources, discuss projects, and stay connected.',
      type: 'department',
      memberCount: 245,
      coverImage: null,
      isJoined: true,
      eligibility: {
        departments: ['Computer Science'],
        courses: ['All'],
        roles: ['all']
      },
      stats: {
        totalPosts: 89,
        lastActivity: new Date('2024-01-20'),
        activeMembers: 156
      }
    },
    {
      _id: '2',
      name: 'B.Tech 2021-2025',
      description: 'Connect with your batchmates and share experiences. From academics to placements, we discuss it all.',
      type: 'batch',
      memberCount: 156,
      coverImage: null,
      isJoined: true,
      eligibility: {
        departments: ['All'],
        courses: ['B.Tech'],
        batches: ['2021-2025'],
        roles: ['student', 'alumni']
      },
      stats: {
        totalPosts: 234,
        lastActivity: new Date('2024-01-21'),
        activeMembers: 98
      }
    },
    {
      _id: '3',
      name: 'Job Opportunities',
      description: 'Latest job openings and internship opportunities. Get referrals and career guidance from alumni.',
      type: 'opportunities',
      memberCount: 412,
      coverImage: null,
      isJoined: false,
      eligibility: {
        departments: ['All'],
        courses: ['All'],
        roles: ['all']
      },
      stats: {
        totalPosts: 67,
        lastActivity: new Date('2024-01-21'),
        activeMembers: 234
      }
    },
    {
      _id: '4',
      name: 'Coding Club',
      description: 'Competitive programming and development discussions. Weekly contests and coding challenges.',
      type: 'club',
      memberCount: 89,
      coverImage: null,
      isJoined: true,
      eligibility: {
        departments: ['All'],
        courses: ['All'],
        roles: ['student', 'alumni']
      },
      stats: {
        totalPosts: 145,
        lastActivity: new Date('2024-01-19'),
        activeMembers: 67
      }
    },
    {
      _id: '5',
      name: 'College Events',
      description: 'Stay updated with all college events and festivals. Never miss out on any campus activity.',
      type: 'events',
      memberCount: 567,
      coverImage: null,
      isJoined: false,
      eligibility: {
        departments: ['All'],
        courses: ['All'],
        roles: ['all']
      },
      stats: {
        totalPosts: 23,
        lastActivity: new Date('2024-01-18'),
        activeMembers: 345
      }
    }
  ];

  const communityTypes = [
    { id: 'all', label: 'All', icon: Hash },
    { id: 'department', label: 'Departments', icon: BookOpen },
    { id: 'batch', label: 'Batches', icon: Calendar },
    { id: 'club', label: 'Clubs', icon: Trophy },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'events', label: 'Events', icon: Calendar }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'department': return BookOpen;
      case 'batch': return Calendar;
      case 'club': return Trophy;
      case 'opportunities': return Briefcase;
      case 'events': return Calendar;
      default: return Users;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'department': return 'from-blue-500 to-blue-600';
      case 'batch': return 'from-purple-500 to-purple-600';
      case 'club': return 'from-orange-500 to-orange-600';
      case 'opportunities': return 'from-green-500 to-green-600';
      case 'events': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'department': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'batch': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'club': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'opportunities': return 'bg-green-100 text-green-700 border-green-200';
      case 'events': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredCommunities = mockCommunities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || community.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const joinedCommunities = filteredCommunities.filter(c => c.isJoined);
  const availableCommunities = filteredCommunities.filter(c => !c.isJoined);

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
              <button className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 shadow-lg transition-all hover:scale-105">
                <Plus size={18} />
                <span className="hidden sm:inline">Create</span>
              </button>
            )}
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
    </div>
  );
};

const CommunityCard = ({ community, isJoined }) => {
  const [joining, setJoining] = useState(false);
  const TypeIcon = getTypeIcon(community.type);

  const handleJoinToggle = async () => {
    setJoining(true);
    // Simulate API call
    setTimeout(() => {
      setJoining(false);
    }, 1000);
  };

  const formatLastActivity = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `Active ${diffInHours}h ago`;
    if (diffInHours < 168) return `Active ${Math.floor(diffInHours / 24)}d ago`;
    return `Active ${activityDate.toLocaleDateString()}`;
  };

  return (
    <div className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 cursor-pointer">
      <div className="px-4 py-4">
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
            <span>{community.memberCount} members</span>
          </div>
          <div className="flex items-center space-x-1">
            <Hash size={14} />
            <span>{community.stats.totalPosts} posts</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp size={14} />
            <span>{community.stats.activeMembers} active</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock size={12} />
            <span>{formatLastActivity(community.stats.lastActivity)}</span>
          </div>

          <button
            onClick={handleJoinToggle}
            disabled={joining}
            className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${
              isJoined
                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {joining ? (
              <div className="loading-spinner h-4 w-4"></div>
            ) : isJoined ? (
              'Joined'
            ) : (
              'Join'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getTypeIcon = (type) => {
  switch (type) {
    case 'department': return BookOpen;
    case 'batch': return Calendar;
    case 'club': return Trophy;
    case 'opportunities': return Briefcase;
    case 'events': return Calendar;
    default: return Users;
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case 'department': return 'from-blue-500 to-blue-600';
    case 'batch': return 'from-purple-500 to-purple-600';
    case 'club': return 'from-orange-500 to-orange-600';
    case 'opportunities': return 'from-green-500 to-green-600';
    case 'events': return 'from-red-500 to-red-600';
    default: return 'from-gray-500 to-gray-600';
  }
};

const getTypeBadgeColor = (type) => {
  switch (type) {
    case 'department': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'batch': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'club': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'opportunities': return 'bg-green-100 text-green-700 border-green-200';
    case 'events': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default Communities;
