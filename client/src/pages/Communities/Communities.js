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
  Filter
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
      description: 'Official community for CS students and faculty',
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
        lastActivity: new Date('2024-01-20')
      }
    },
    {
      _id: '2',
      name: 'B.Tech 2021-2025',
      description: 'Connect with your batchmates and share experiences',
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
        lastActivity: new Date('2024-01-21')
      }
    },
    {
      _id: '3',
      name: 'Job Opportunities',
      description: 'Latest job openings and internship opportunities',
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
        lastActivity: new Date('2024-01-21')
      }
    },
    {
      _id: '4',
      name: 'Coding Club',
      description: 'Competitive programming and development discussions',
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
        lastActivity: new Date('2024-01-19')
      }
    },
    {
      _id: '5',
      name: 'College Events',
      description: 'Stay updated with all college events and festivals',
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
        lastActivity: new Date('2024-01-18')
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
      case 'department': return 'bg-blue-100 text-blue-800';
      case 'batch': return 'bg-purple-100 text-purple-800';
      case 'club': return 'bg-orange-100 text-orange-800';
      case 'opportunities': return 'bg-green-100 text-green-800';
      case 'events': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="min-h-screen bg-gray-50 w-full mobile-overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 md:py-6 w-full page-header">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Communities</h1>
            {['teacher', 'principal', 'admin'].includes(user?.role) && (
              <button className="btn-primary flex items-center space-x-2 text-sm md:text-base">
                <Plus size={18} />
                <span className="hidden sm:inline">Create</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-8 md:pl-10 text-sm md:text-base"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2 mobile-tabs">
            {communityTypes.map((type) => {
              const Icon = type.icon;
              const isActive = selectedFilter === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedFilter(type.id)}
                  className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={14} />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full px-3 md:px-4 py-4 md:py-6 mobile-content">
        {/* My Communities */}
        {joinedCommunities.length > 0 && (
          <div className="w-full mb-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">My Communities</h2>
            <div className="space-y-3 md:space-y-4 w-full">
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
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
              {joinedCommunities.length > 0 ? 'Discover More' : 'All Communities'}
            </h2>
            <div className="space-y-3 md:space-y-4 w-full">
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
          <div className="text-center py-8 md:py-12 w-full">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
            </div>
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No communities found</h3>
            <p className="text-sm md:text-base text-gray-500 px-4">
              Try adjusting your search or filter criteria
            </p>
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
    
    if (diffInHours < 24) return `Active ${diffInHours}h ago`;
    if (diffInHours < 168) return `Active ${Math.floor(diffInHours / 24)}d ago`;
    return `Active ${activityDate.toLocaleDateString()}`;
  };

  return (
    <div className="card hover:shadow-md transition-all cursor-pointer w-full">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 md:space-x-4 flex-1 min-w-0">
          {/* Community Icon */}
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {community.coverImage ? (
              <img 
                src={community.coverImage} 
                alt={community.name}
                className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover"
              />
            ) : (
              <TypeIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            )}
          </div>

          {/* Community Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">
                {community.name}
              </h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(community.type)}`}>
                {community.type}
              </span>
            </div>
            
            <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">
              {community.description}
            </p>

            <div className="flex items-center space-x-3 md:space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Users size={12} />
                <span>{community.memberCount} members</span>
              </div>
              <div className="flex items-center space-x-1">
                <Hash size={12} />
                <span>{community.stats.totalPosts} posts</span>
              </div>
              <span className="hidden sm:inline">{formatLastActivity(community.stats.lastActivity)}</span>
            </div>
          </div>
        </div>

        {/* Join/Joined Button */}
        <button
          onClick={handleJoinToggle}
          disabled={joining}
          className={`px-3 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm transition-colors flex-shrink-0 ${
            isJoined
              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              : 'btn-primary'
          }`}
        >
          {joining ? (
            <div className="loading-spinner h-3 w-3 md:h-4 md:w-4"></div>
          ) : isJoined ? (
            'Joined'
          ) : (
            'Join'
          )}
        </button>
      </div>
    </div>
  );
};

// Helper functions (move these outside component if used elsewhere)
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
    case 'department': return 'bg-blue-100 text-blue-800';
    case 'batch': return 'bg-purple-100 text-purple-800';
    case 'club': return 'bg-orange-100 text-orange-800';
    case 'opportunities': return 'bg-green-100 text-green-800';
    case 'events': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default Communities;