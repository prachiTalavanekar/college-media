import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from '../../components/Posts/PostCard';
import FilterTabs from '../../components/Home/FilterTabs';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Pin, TrendingUp, Clock, Users } from 'lucide-react';

const Home = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    hasMore: true
  });

  // Fetch posts from API
  const fetchPosts = async (page = 1, type = 'all', append = false) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: 10,
        ...(type !== 'all' && { type })
      };
      
      console.log('Fetching posts with params:', params);
      
      const response = await api.get('/posts', { params });
      
      console.log('Posts response:', response.data);
      
      if (append) {
        setPosts(prev => [...prev, ...response.data.posts]);
      } else {
        setPosts(response.data.posts);
      }
      
      setPagination(response.data.pagination || {
        currentPage: page,
        hasMore: response.data.posts.length === 10
      });
      
    } catch (error) {
      console.error('Error fetching posts:', error);
      
      if (error.response?.status === 401) {
        toast.error('Please log in to view posts');
      } else {
        toast.error('Failed to load posts');
      }
      
      // Fallback to mock data if API fails
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };

  // Load posts on component mount and filter change
  useEffect(() => {
    const postType = activeFilter === 'announcements' ? 'announcement' :
                    activeFilter === 'opportunities' ? 'opportunity' :
                    activeFilter === 'community' ? 'community_post' : 'all';
    
    fetchPosts(1, postType);
  }, [activeFilter]);

  // Load more posts
  const loadMorePosts = () => {
    if (!loading && pagination.hasMore) {
      const postType = activeFilter === 'announcements' ? 'announcement' :
                      activeFilter === 'opportunities' ? 'opportunity' :
                      activeFilter === 'community' ? 'community_post' : 'all';
      
      fetchPosts(pagination.currentPage + 1, postType, true);
    }
  };

  // Mock data as fallback
  const mockPosts = [
    {
      _id: '1',
      author: {
        _id: 'user1',
        name: 'Dr. Sarah Johnson',
        role: 'teacher',
        department: 'Computer Science',
        profileImage: null
      },
      content: 'Important: Mid-semester exams will be conducted from March 15-20. Please check the detailed schedule on the college portal. All students must carry their ID cards and admit cards.',
      postType: 'announcement',
      isPinned: true,
      targetAudience: {
        departments: ['Computer Science'],
        courses: ['B.Tech', 'M.Tech'],
        batches: ['2021-2025', '2022-2026'],
        roles: ['student']
      },
      likes: [{ user: 'user2' }, { user: 'user3' }],
      comments: [
        {
          user: { name: 'John Doe', role: 'student' },
          content: 'Thank you for the update!',
          createdAt: new Date()
        }
      ],
      createdAt: new Date('2024-01-20'),
      likeCount: 2,
      commentCount: 1
    },
    {
      _id: '2',
      author: {
        _id: 'user2',
        name: 'Alex Kumar',
        role: 'alumni',
        department: 'Computer Science',
        currentCompany: 'Google',
        profileImage: null
      },
      content: 'Exciting opportunity! Google is hiring for Software Engineer positions. Great chance for final year students. DM me for referrals. Requirements: Strong DSA skills, experience with React/Node.js preferred.',
      postType: 'opportunity',
      opportunityDetails: {
        title: 'Software Engineer',
        company: 'Google',
        location: 'Bangalore',
        type: 'job',
        applicationDeadline: new Date('2024-02-15')
      },
      targetAudience: {
        departments: ['Computer Science'],
        courses: ['B.Tech'],
        batches: ['2020-2024'],
        roles: ['student']
      },
      likes: [{ user: 'user1' }, { user: 'user3' }, { user: 'user4' }],
      comments: [],
      createdAt: new Date('2024-01-19'),
      likeCount: 3,
      commentCount: 0
    },
    {
      _id: '3',
      author: {
        _id: 'user3',
        name: 'Priya Sharma',
        role: 'student',
        department: 'Computer Science',
        course: 'B.Tech',
        batch: '2021-2025',
        profileImage: null
      },
      content: 'Just completed my internship at Microsoft! Amazing experience working on Azure services. Happy to share insights with juniors. The key is to start preparing early and focus on system design concepts.',
      postType: 'community_post',
      targetAudience: {
        departments: ['All'],
        courses: ['All'],
        batches: [],
        roles: ['all']
      },
      likes: [{ user: 'user1' }, { user: 'user2' }],
      comments: [
        {
          user: { name: 'Rahul Singh', role: 'student' },
          content: 'Congratulations! Can you share some tips?',
          createdAt: new Date()
        }
      ],
      createdAt: new Date('2024-01-18'),
      likeCount: 2,
      commentCount: 1
    }
  ];

  const filterTabs = useMemo(() => [
    { id: 'all', label: 'All Posts', icon: Clock },
    { id: 'announcements', label: 'Announcements', icon: Pin },
    { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
    { id: 'community', label: 'Community', icon: Users }
  ], []);

  const filteredPosts = useMemo(() => {
    return posts;
  }, [posts]);

  return (
    <div className="min-h-screen bg-gray-50 w-full pb-20">
      {/* Filter Tabs */}
      <div className="sticky top-0 z-10 bg-gray-50 pt-4 pb-3 px-4">
        <FilterTabs 
          tabs={filterTabs}
          activeTab={activeFilter}
          onTabChange={setActiveFilter}
        />
      </div>

      {/* Posts Feed */}
      <div className="w-full">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="loading-spinner h-8 w-8"></div>
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <div key={post._id} className="w-full border-b-8 border-gray-100">
              <PostCard post={post} />
            </div>
          ))
        ) : (
          <div className="text-center py-8 md:py-12 px-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
            </div>
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-sm md:text-base text-gray-500 mb-4 px-4">
              Be the first to share something with your college community!
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredPosts.length > 0 && pagination.hasMore && (
        <div className="text-center py-6 px-4">
          <button 
            onClick={loadMorePosts}
            disabled={loading}
            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load More Posts'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;