import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  Users, 
  Briefcase, 
  Calendar,
  Pin,
  CheckCircle,
  X,
  Settings,
  UserPlus
} from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  });

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      console.log('Fetching notifications...');
      const response = await api.get('/notifications', {
        params: {
          page,
          limit: 20,
          unreadOnly: filter === 'unread'
        }
      });
      
      console.log('Notifications response:', response.data);
      console.log('Notifications array:', response.data.notifications);
      console.log('Notifications length:', response.data.notifications.length);
      
      setNotifications(response.data.notifications);
      setPagination(response.data.pagination);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const filterOptions = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'unread', label: 'Unread', icon: Bell },
    { id: 'connection_request', label: 'Connections', icon: UserPlus },
    { id: 'like', label: 'Likes', icon: Heart },
    { id: 'comment', label: 'Comments', icon: MessageCircle }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request': return UserPlus;
      case 'connection_accepted': return CheckCircle;
      case 'like': return Heart;
      case 'comment': return MessageCircle;
      case 'announcement': return Pin;
      case 'opportunity': return Briefcase;
      case 'community': return Users;
      case 'verification': return CheckCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'connection_request': return 'bg-blue-100 text-blue-600';
      case 'connection_accepted': return 'bg-green-100 text-green-600';
      case 'like': return 'bg-red-100 text-red-600';
      case 'comment': return 'bg-blue-100 text-blue-600';
      case 'announcement': return 'bg-yellow-100 text-yellow-600';
      case 'opportunity': return 'bg-green-100 text-green-600';
      case 'community': return 'bg-purple-100 text-purple-600';
      case 'verification': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'alumni': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const filteredNotifications = filter === 'all' || filter === 'unread' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full mobile-overflow-hidden">
      {/* Header */}
      <div className="page-header md:bg-white md:border-b md:border-gray-200 md:px-6 md:py-6 w-full">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="mobile-text-sm md:text-sm text-blue-600 hover:text-blue-700 font-medium min-h-[44px] px-2"
                >
                  Mark all read
                </button>
              )}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mobile-tabs flex space-x-2 overflow-x-auto pb-2">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              const isActive = filter === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => setFilter(option.id)}
                  className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg font-medium mobile-text-sm transition-all whitespace-nowrap min-h-[44px] ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="w-full mobile-content md:px-6 md:py-6">
        {filteredNotifications.length > 0 ? (
          <div className="mobile-space-y-4 md:space-y-2 w-full">
            {filteredNotifications.map(notification => {
              const Icon = getNotificationIcon(notification.type);
              
              return (
                <div
                  key={notification._id}
                  className={`card hover:shadow-md transition-all cursor-pointer w-full min-h-[80px] ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3 md:space-x-4 w-full">
                    {/* Notification Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      <Icon size={18} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-gray-900 mobile-text-base line-clamp-2 pr-2">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className="mobile-text-sm text-gray-500 whitespace-nowrap">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>

                      <p className="mobile-text-sm text-gray-600 mb-2 line-clamp-2 md:line-clamp-2">
                        {notification.message}
                      </p>

                      {/* User Info */}
                      {notification.sender && (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {notification.sender.profileImage ? (
                              <img 
                                src={notification.sender.profileImage} 
                                alt={notification.sender.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-600 font-medium text-xs">
                                {notification.sender.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="mobile-text-sm text-gray-500 truncate">
                            {notification.sender.name}
                          </span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(notification.sender.role)}`}>
                            {notification.sender.role}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dismiss Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 w-full mobile-content">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
            </h3>
            <p className="text-gray-500 mobile-text-sm px-4">
              {filter === 'all' 
                ? "You're all caught up! Check back later for updates."
                : `No ${filter} notifications at the moment.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;