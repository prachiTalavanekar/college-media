import React, { useState } from 'react';
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
  Settings
} from 'lucide-react';

const Notifications = () => {
  const [filter, setFilter] = useState('all');

  // Mock notifications data
  const mockNotifications = [
    {
      _id: '1',
      type: 'like',
      title: 'New like on your post',
      message: 'Alex Kumar liked your post about Microsoft internship',
      user: {
        name: 'Alex Kumar',
        profileImage: null,
        role: 'alumni'
      },
      isRead: false,
      createdAt: new Date('2024-01-21T10:30:00'),
      actionUrl: '/post/123'
    },
    {
      _id: '2',
      type: 'comment',
      title: 'New comment on your post',
      message: 'Priya Sharma commented: "Congratulations! Can you share some tips?"',
      user: {
        name: 'Priya Sharma',
        profileImage: null,
        role: 'student'
      },
      isRead: false,
      createdAt: new Date('2024-01-21T09:15:00'),
      actionUrl: '/post/123'
    },
    {
      _id: '3',
      type: 'announcement',
      title: 'New announcement from CS Department',
      message: 'Mid-semester exams will be conducted from March 15-20',
      user: {
        name: 'Dr. Sarah Johnson',
        profileImage: null,
        role: 'teacher'
      },
      isRead: true,
      createdAt: new Date('2024-01-20T14:00:00'),
      actionUrl: '/post/456'
    },
    {
      _id: '4',
      type: 'opportunity',
      title: 'New job opportunity posted',
      message: 'Software Engineer position at Google - Apply by Feb 15',
      user: {
        name: 'Alex Kumar',
        profileImage: null,
        role: 'alumni'
      },
      isRead: true,
      createdAt: new Date('2024-01-19T16:45:00'),
      actionUrl: '/post/789'
    },
    {
      _id: '5',
      type: 'community',
      title: 'Invited to join Coding Club',
      message: 'You have been invited to join the Coding Club community',
      user: {
        name: 'Coding Club Admin',
        profileImage: null,
        role: 'admin'
      },
      isRead: true,
      createdAt: new Date('2024-01-18T11:20:00'),
      actionUrl: '/communities/coding-club'
    },
    {
      _id: '6',
      type: 'verification',
      title: 'Account verified successfully',
      message: 'Your account has been verified by the admin. Welcome to CampusConnect!',
      user: {
        name: 'System',
        profileImage: null,
        role: 'admin'
      },
      isRead: true,
      createdAt: new Date('2024-01-15T09:00:00'),
      actionUrl: null
    }
  ];

  const filterOptions = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'like', label: 'Likes', icon: Heart },
    { id: 'comment', label: 'Comments', icon: MessageCircle },
    { id: 'announcement', label: 'Announcements', icon: Pin },
    { id: 'opportunity', label: 'Opportunities', icon: Briefcase },
    { id: 'community', label: 'Communities', icon: Users }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
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

  const filteredNotifications = mockNotifications.filter(notification => 
    filter === 'all' || notification.type === filter
  );

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  const markAsRead = (id) => {
    // In real app, make API call to mark as read
    console.log('Mark as read:', id);
  };

  const markAllAsRead = () => {
    // In real app, make API call to mark all as read
    console.log('Mark all as read');
  };

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
                    !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => {
                    markAsRead(notification._id);
                    if (notification.actionUrl) {
                      // Navigate to the action URL
                      console.log('Navigate to:', notification.actionUrl);
                    }
                  }}
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
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>

                      <p className="mobile-text-sm text-gray-600 mb-2 line-clamp-2 md:line-clamp-2">
                        {notification.message}
                      </p>

                      {/* User Info */}
                      {notification.user.name !== 'System' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {notification.user.profileImage ? (
                              <img 
                                src={notification.user.profileImage} 
                                alt={notification.user.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-600 font-medium text-xs">
                                {notification.user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="mobile-text-sm text-gray-500 truncate">
                            {notification.user.name}
                          </span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(notification.user.role)}`}>
                            {notification.user.role}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dismiss Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle dismiss notification
                        console.log('Dismiss notification:', notification._id);
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