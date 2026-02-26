import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, MessageCircle } from 'lucide-react';
import ProfileSidebar from '../Profile/ProfileSidebar';
import api from '../../utils/api';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll for new messages every 10 seconds
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/messages/unread-count');
      setUnreadMessageCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Hide header for admin users
  if (user?.role === 'admin') {
    return null;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <button 
              onClick={() => setShowProfileSidebar(true)}
              className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200 overflow-hidden"
            >
              {user?.profileImage ? (
                <img 
                  key={user.profileImage}
                  src={user.profileImage} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onLoad={() => console.log('Header image loaded:', user.profileImage)}
                  onError={(e) => console.error('Header image failed to load:', user.profileImage, e)}
                />
              ) : (
                <span className="text-blue-600 font-semibold text-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
          </div>

          <button 
            onClick={() => navigate('/messages')}
            className="flex-shrink-0 p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full relative"
          >
            <MessageCircle size={24} />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <ProfileSidebar 
        isOpen={showProfileSidebar} 
        onClose={() => setShowProfileSidebar(false)} 
      />
    </>
  );
};

export default Header;
