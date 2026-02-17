import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Users, FileText, X, Filter } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    users: [],
    posts: [],
    totalUsers: 0,
    totalPosts: 0
  });
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    course: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Perform search
  const performSearch = async (query, tab = activeTab) => {
    if (!query || query.trim().length < 2) {
      setResults({ users: [], posts: [], totalUsers: 0, totalPosts: 0 });
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (tab === 'all') {
        response = await api.get('/search/all', {
          params: { q: query }
        });
        setResults({
          users: response.data.users || [],
          posts: response.data.posts || [],
          totalUsers: response.data.totalUsers || 0,
          totalPosts: response.data.totalPosts || 0
        });
      } else if (tab === 'users') {
        response = await api.get('/search/users', {
          params: { 
            q: query,
            ...filters
          }
        });
        setResults({
          users: response.data.users || [],
          posts: [],
          totalUsers: response.data.pagination?.totalResults || 0,
          totalPosts: 0
        });
      } else if (tab === 'posts') {
        response = await api.get('/search/posts', {
          params: { q: query }
        });
        setResults({
          users: [],
          posts: response.data.posts || [],
          totalUsers: 0,
          totalPosts: response.data.pagination?.totalResults || 0
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      setSearchParams({ q: searchQuery });
      performSearch(searchQuery);
    }
  };

  // Load initial search if query exists
  useEffect(() => {
    if (initialQuery && initialQuery.length >= 2) {
      performSearch(initialQuery);
    }
  }, []);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (searchQuery.trim().length >= 2) {
      performSearch(searchQuery, tab);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'alumni': return 'bg-purple-100 text-purple-800';
      case 'student': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      {/* Search Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for people, posts..."
              className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setResults({ users: [], posts: [], totalUsers: 0, totalPosts: 0 });
                  setSearchParams({});
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </form>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mt-4 max-w-3xl mx-auto">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleTabChange('users')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users size={18} />
            People {results.totalUsers > 0 && `(${results.totalUsers})`}
          </button>
          <button
            onClick={() => handleTabChange('posts')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText size={18} />
            Posts {results.totalPosts > 0 && `(${results.totalPosts})`}
          </button>
          {activeTab === 'users' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 bg-white text-gray-600 hover:bg-gray-50"
            >
              <Filter size={18} />
              Filters
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && activeTab === 'users' && (
          <div className="mt-4 p-4 bg-white rounded-xl shadow-md max-w-3xl mx-auto animate-fadeIn">
            <div className="grid grid-cols-3 gap-3">
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="alumni">Alumni</option>
                <option value="teacher">Teacher</option>
              </select>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>
              <button
                onClick={() => {
                  setFilters({ role: '', department: '', course: '' });
                  if (searchQuery.trim().length >= 2) {
                    performSearch(searchQuery);
                  }
                }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : searchQuery.trim().length < 2 ? (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Search CollegeConnect</h3>
            <p className="text-gray-600">Find people, posts, and opportunities</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Users Results */}
            {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users size={20} />
                  People
                </h3>
                <div className="space-y-3">
                  {results.users.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => navigate(`/profile/${user._id}`)}
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-xl">{user.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{user.name}</h4>
                          <p className="text-sm text-gray-600 truncate">
                            {user.department} • {user.course}
                          </p>
                          {user.currentCompany && (
                            <p className="text-sm text-gray-500 truncate">{user.currentCompany}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Results */}
            {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Posts
                </h3>
                <div className="space-y-3">
                  {results.posts.map((post) => (
                    <div
                      key={post._id}
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {post.author.profileImage ? (
                            <img src={post.author.profileImage} alt={post.author.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-semibold">{post.author.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
                          <p className="text-xs text-gray-500">{post.author.department} • {post.author.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-800 line-clamp-3">{post.content}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <span>{post.likes?.length || 0} likes</span>
                        <span>{post.comments?.length || 0} comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {results.users.length === 0 && results.posts.length === 0 && (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try different keywords or filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
