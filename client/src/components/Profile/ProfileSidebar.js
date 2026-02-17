import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { 
  X, 
  User, 
  Settings, 
  LogOut, 
  MapPin, 
  Briefcase, 
  Gamepad2,
  Bookmark,
  Users,
  Crown
} from 'lucide-react';

const ProfileSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileStats, setProfileStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile stats from database
  useEffect(() => {
    const fetchProfileStats = async () => {
      if (!user?.id || !isOpen) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/profile/user/${user.id}`);
        setProfileStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching profile stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileStats();
  }, [user?.id, isOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl overflow-y-auto hide-scrollbar transform transition-transform">
        <div className="p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          {/* Profile Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-3 border-blue-200 flex-shrink-0">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-bold text-2xl">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">
                  {user?.name || 'User Name'}
                </h2>
                
                {/* Student Info */}
                {user?.role === 'student' && (
                  <>
                    {user?.department && user?.course && (
                      <p className="text-sm text-gray-600 mb-1">
                        {user.department} • {user.course}
                        {user.batch && ` • ${user.batch}`}
                      </p>
                    )}
                    {user?.currentYear && (
                      <p className="text-xs text-gray-500 mb-2">
                        Year {user.currentYear}
                        {user.currentSemester && ` • Semester ${user.currentSemester}`}
                      </p>
                    )}
                  </>
                )}

                {/* Alumni Info */}
                {user?.role === 'alumni' && (
                  <>
                    {user?.department && user?.course && (
                      <p className="text-sm text-gray-600 mb-1">
                        {user.department} • {user.course}
                        {user.graduationYear && ` • Class of ${user.graduationYear}`}
                      </p>
                    )}
                    {user?.currentCompany && (
                      <p className="text-xs text-gray-500 mb-2">
                        {user.jobTitle && `${user.jobTitle} at `}{user.currentCompany}
                      </p>
                    )}
                  </>
                )}

                {/* Teacher Info */}
                {user?.role === 'teacher' && (
                  <>
                    {user?.department && (
                      <p className="text-sm text-gray-600 mb-1">
                        {user.department} Department
                        {user.department_head && ' • Head of Department'}
                      </p>
                    )}
                  </>
                )}

                {/* Principal Info */}
                {user?.role === 'principal' && (
                  <p className="text-sm text-gray-600 mb-1">
                    Principal
                    {user?.department && ` • ${user.department}`}
                  </p>
                )}

                {/* Location */}
                {user?.location && (
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin size={14} className="mr-1" />
                    <span>{user.location}</span>
                  </div>
                )}

                {/* Role Badge */}
                {user?.role && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Briefcase size={14} className="mr-1" />
                    <span className="capitalize">{user.role}</span>
                    {user?.mentor && user.role === 'alumni' && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        Mentor
                      </span>
                    )}
                    {user?.verified_recruiter && user.role === 'alumni' && (
                      <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                        Verified Recruiter
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {user?.bio && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {user.bio}
              </p>
            )}

            {/* Stats from Database */}
            {!loading && profileStats && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {profileStats.profileViewers || 0}
                  </div>
                  <div className="text-sm text-gray-500">profile viewers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {profileStats.postCount || 0}
                  </div>
                  <div className="text-sm text-gray-500">posts</div>
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            {/* Puzzle Games */}
            <button
              onClick={() => handleNavigation('/games')}
              className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Gamepad2 size={20} />
              <span className="font-medium">Puzzle Games</span>
            </button>

            {/* Saved Posts */}
            <button
              onClick={() => handleNavigation('/saved')}
              className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Bookmark size={20} />
              <span className="font-medium">Saved posts</span>
            </button>

            {/* Groups */}
            <button
              onClick={() => handleNavigation('/groups')}
              className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Users size={20} />
              <span className="font-medium">Groups</span>
            </button>
          </div>

          {/* Premium Banner */}
          <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => {}}
            >
              <X size={16} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Crown size={16} className="text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Try Premium for ₹0</p>
                <p className="text-sm text-gray-600">Unlock exclusive features</p>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-2">
            {/* View Profile */}
            <button
              onClick={() => handleNavigation('/profile')}
              className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <User size={20} />
              <span className="font-medium">View Profile</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => handleNavigation('/settings')}
              className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full p-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;
