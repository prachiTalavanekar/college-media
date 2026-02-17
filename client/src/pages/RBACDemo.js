import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import ProtectedAction, { ProtectedRole } from '../components/Common/ProtectedAction';
import RoleBadge, { UserBadges } from '../components/Common/RoleBadge';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  Users, 
  FileText, 
  Briefcase, 
  TrendingUp,
  CheckCircle,
  XCircle
} from 'lucide-react';

const RBACDemo = () => {
  const { user } = useAuth();
  const { can, isRole, permissions } = usePermissions();

  // Sample permissions to display
  const permissionChecks = [
    { key: 'canCreatePosts', label: 'Create Posts' },
    { key: 'canCreateCommunity', label: 'Create Communities' },
    { key: 'canPostAnnouncement', label: 'Post Announcements' },
    { key: 'canPostOpportunities', label: 'Post Opportunities' },
    { key: 'canUploadAcademicResources', label: 'Upload Academic Resources' },
    { key: 'canPinPosts', label: 'Pin Posts' },
    { key: 'canModerateComments', label: 'Moderate Comments' },
    { key: 'canAccessAdminDashboard', label: 'Access Admin Dashboard' },
    { key: 'canVerifyUsers', label: 'Verify Users' },
    { key: 'canViewPlatformAnalytics', label: 'View Platform Analytics' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                RBAC System Demo
              </h1>
              <p className="text-gray-600">
                Role-Based Access Control is now active!
              </p>
            </div>
            <Shield className="w-16 h-16 text-blue-600" />
          </div>
        </div>

        {/* Current User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Profile</h2>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
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
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-600">
                {user?.department} • {user?.course}
              </p>
              <div className="mt-2">
                <UserBadges user={user} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Permissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissionChecks.map((check) => {
              const hasPermission = can(check.key);
              return (
                <div 
                  key={check.key}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 ${
                    hasPermission 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {hasPermission ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`font-medium ${
                    hasPermission ? 'text-green-900' : 'text-gray-500'
                  }`}>
                    {check.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role-Based Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Student Section */}
          <ProtectedRole roles="student">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-bold text-blue-900">Student Features</h3>
              </div>
              <ul className="space-y-2 text-blue-800">
                <li>✓ Create posts in communities</li>
                <li>✓ Join open communities</li>
                <li>✓ Apply to opportunities</li>
                <li>✓ Message alumni</li>
              </ul>
            </div>
          </ProtectedRole>

          {/* Alumni Section */}
          <ProtectedRole roles="alumni">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Briefcase className="w-8 h-8 text-purple-600" />
                <h3 className="text-lg font-bold text-purple-900">Alumni Features</h3>
              </div>
              <ul className="space-y-2 text-purple-800">
                <li>✓ Post job opportunities</li>
                <li>✓ Upload study materials</li>
                <li>✓ Offer mentorship</li>
                <li>✓ Message students</li>
              </ul>
            </div>
          </ProtectedRole>

          {/* Teacher Section */}
          <ProtectedRole roles="teacher">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-8 h-8 text-green-600" />
                <h3 className="text-lg font-bold text-green-900">Teacher Features</h3>
              </div>
              <ul className="space-y-2 text-green-800">
                <li>✓ Create communities</li>
                <li>✓ Post announcements</li>
                <li>✓ Upload resources</li>
                <li>✓ Moderate content</li>
              </ul>
            </div>
          </ProtectedRole>

          {/* Principal Section */}
          <ProtectedRole roles="principal">
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
                <h3 className="text-lg font-bold text-indigo-900">Principal Features</h3>
              </div>
              <ul className="space-y-2 text-indigo-800">
                <li>✓ College-wide announcements</li>
                <li>✓ Platform analytics</li>
                <li>✓ Emergency notifications</li>
                <li>✓ Event approvals</li>
              </ul>
            </div>
          </ProtectedRole>

          {/* Admin Section */}
          <ProtectedRole roles="admin">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-8 h-8 text-red-600" />
                <h3 className="text-lg font-bold text-red-900">Admin Features</h3>
              </div>
              <ul className="space-y-2 text-red-800">
                <li>✓ Verify users</li>
                <li>✓ Change roles</li>
                <li>✓ Block users</li>
                <li>✓ System configuration</li>
              </ul>
            </div>
          </ProtectedRole>
        </div>

        {/* Protected Actions Demo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Conditional Actions (Based on Your Permissions)
          </h2>
          <div className="space-y-3">
            <ProtectedAction action="canCreateCommunity">
              <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Create Community (You have permission!)
              </button>
            </ProtectedAction>

            <ProtectedAction action="canPostAnnouncement">
              <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                Post Announcement (You have permission!)
              </button>
            </ProtectedAction>

            <ProtectedAction action="canPostOpportunities">
              <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Post Job Opportunity (You have permission!)
              </button>
            </ProtectedAction>

            <ProtectedAction action="canAccessAdminDashboard">
              <button className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium">
                Access Admin Dashboard (You have permission!)
              </button>
            </ProtectedAction>

            {!can('canCreateCommunity') && !can('canPostAnnouncement') && 
             !can('canPostOpportunities') && !can('canAccessAdminDashboard') && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg font-medium mb-2">
                  You're seeing only the actions available to your role
                </p>
                <p className="text-sm">
                  Other role-specific buttons are hidden based on your permissions
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Documentation Link */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            📚 RBAC Documentation
          </h3>
          <p className="text-blue-800 mb-4">
            Check the project root for comprehensive documentation:
          </p>
          <ul className="space-y-1 text-blue-700 text-sm">
            <li>• <code className="bg-blue-100 px-2 py-1 rounded">RBAC_IMPLEMENTATION.md</code> - Complete guide</li>
            <li>• <code className="bg-blue-100 px-2 py-1 rounded">RBAC_QUICK_START.md</code> - Quick reference</li>
            <li>• <code className="bg-blue-100 px-2 py-1 rounded">INTEGRATION_EXAMPLE.md</code> - Code examples</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RBACDemo;
