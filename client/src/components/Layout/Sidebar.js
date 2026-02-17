import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import RoleBadge from '../Common/RoleBadge';
import { 
  Home, 
  Users, 
  Plus, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Shield,
  GraduationCap,
  Briefcase,
  TrendingUp
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { can } = usePermissions();

  // Admin users only see Admin Panel
  const navItems = user?.role === 'admin' ? [
    {
      path: '/admin',
      icon: Shield,
      label: 'Admin Panel',
      show: true,
      exact: false
    }
  ] : [
    {
      path: '/',
      icon: Home,
      label: 'Home',
      exact: true,
      show: true
    },
    {
      path: '/communities',
      icon: Users,
      label: 'Communities',
      show: true
    },
    {
      path: '/create',
      icon: Plus,
      label: 'Create Post',
      show: can('canCreatePosts')
    },
    {
      path: '/notifications',
      icon: Bell,
      label: 'Notifications',
      show: true
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
      show: true
    },
    {
      path: '/opportunities',
      icon: Briefcase,
      label: 'Opportunities',
      show: can('canViewOpportunityDashboard')
    },
    {
      path: '/analytics',
      icon: TrendingUp,
      label: 'Analytics',
      show: can('canViewPlatformAnalytics')
    }
  ];

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter(item => item.show);

  return (
    <aside className="desktop-sidebar">
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CampusConnect</h1>
              <p className="text-sm text-gray-500">Academic Network</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-blue-600 font-semibold text-lg">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.department} • {user?.course}
              </p>
              {/* Use the new RoleBadge component */}
              <div className="mt-1">
                <RoleBadge user={user} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
          <button 
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;