import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import {
  Users, FileText, Shield, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Settings, LogOut, Search, Eye, UserCheck, UserX, BarChart3, Activity,
  Database, Mail, Bell, Download, Send, Trash2, RefreshCw, Filter
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    department: 'all',
    verificationStatus: 'all'
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, reportsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users/pending'),
        api.get('/admin/posts/reported'),
        api.get('/admin/users')
      ]);
      
      setStats(statsRes.data);
      setPendingUsers(pendingRes.data.users);
      setReportedPosts(reportsRes.data.posts);
      setAllUsers(usersRes.data.users);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, reason = null) => {
    try {
      switch (action) {
        case 'verify':
          await api.post(`/admin/users/${userId}/verify`);
          toast.success('User verified successfully');
          break;
        case 'block':
          await api.post(`/admin/users/${userId}/block`, { reason });
          toast.success('User blocked successfully');
          break;
        case 'unblock':
          await api.post(`/admin/users/${userId}/unblock`);
          toast.success('User unblocked successfully');
          break;
        default:
          return;
      }
      fetchDashboardData();
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const handlePostAction = async (postId, action) => {
    try {
      if (action === 'approve') {
        await api.post(`/admin/posts/${postId}/approve`);
        toast.success('Post approved successfully');
      } else if (action === 'delete') {
        await api.delete(`/admin/posts/${postId}`);
        toast.success('Post deleted successfully');
      }
      fetchDashboardData();
    } catch (error) {
      console.error(`Error ${action} post:`, error);
      toast.error(`Failed to ${action} post`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Professional Header with Dark Blue */}
      <header className="bg-slate-800 shadow-lg border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-slate-200" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-slate-400">CollegeConnect Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all">
                <Bell size={22} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3 px-4 py-2 bg-slate-700 rounded-xl">
                <div className="w-10 h-10 bg-slate-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400">System Administrator</p>
                </div>
              </div>
              
              <button
                onClick={() => { logout(); navigate('/admin/login'); }}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-xl transition-all font-medium"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-2 inline-flex space-x-2 border border-slate-200">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'pending', label: 'Pending', icon: Clock, badge: pendingUsers.length },
              { id: 'reports', label: 'Reports', icon: AlertTriangle, badge: reportedPosts.length },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-slate-700 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeTab === tab.id ? 'bg-red-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab with Dark Blue Theme */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stats Cards with Dark Blue Shades */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border-l-4 border-slate-700 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-slate-700" />
                  </div>
                  <TrendingUp className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Users</p>
                <p className="text-4xl font-bold text-slate-900 mb-2">{stats.users.total}</p>
                <p className="text-sm text-slate-500">+{stats.users.recent} this week</p>
              </div>

              <div className="bg-white border-l-4 border-slate-600 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-slate-600" />
                  </div>
                  <Activity className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">Verified Users</p>
                <p className="text-4xl font-bold text-slate-900 mb-2">{stats.users.verified}</p>
                <p className="text-sm text-slate-500">{Math.round((stats.users.verified / stats.users.total) * 100)}% of total</p>
              </div>

              <div className="bg-white border-l-4 border-amber-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">Pending Approval</p>
                <p className="text-4xl font-bold text-slate-900 mb-2">{stats.users.pending}</p>
                <p className="text-sm text-amber-600">Requires attention</p>
              </div>

              <div className="bg-white border-l-4 border-slate-500 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-slate-500" />
                  </div>
                  <TrendingUp className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Posts</p>
                <p className="text-4xl font-bold text-slate-900 mb-2">{stats.posts.total}</p>
                <p className="text-sm text-slate-500">+{stats.posts.recent} this week</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">User Roles Distribution</h3>
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-700" />
                  </div>
                </div>
                <div className="space-y-4">
                  {stats.users.byRole.map((role, index) => {
                    const colors = ['bg-slate-700', 'bg-slate-600', 'bg-slate-500', 'bg-slate-400'];
                    const percentage = (role.count / stats.users.total) * 100;
                    return (
                      <div key={role._id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-700 capitalize">{role._id}s</span>
                          <span className="text-sm font-bold text-slate-900">{role.count}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Top Departments</h3>
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-slate-700" />
                  </div>
                </div>
                <div className="space-y-4">
                  {stats.users.byDepartment.slice(0, 5).map((dept, index) => {
                    const maxCount = stats.users.byDepartment[0].count;
                    const percentage = (dept.count / maxCount) * 100;
                    return (
                      <div key={dept._id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-700">{dept._id}</span>
                          <span className="text-sm font-bold text-slate-900">{dept.count}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-slate-600 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center space-x-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 group">
                  <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">Approve All</p>
                    <p className="text-sm text-slate-600">Verify pending users</p>
                  </div>
                </button>

                <button className="flex items-center space-x-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 group">
                  <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">Export Data</p>
                    <p className="text-sm text-slate-600">Download reports</p>
                  </div>
                </button>

                <button className="flex items-center space-x-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 group">
                  <div className="w-12 h-12 bg-slate-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">Send Alert</p>
                    <p className="text-sm text-slate-600">Notify all users</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pending Users Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Pending Approvals</h2>
                <p className="text-slate-600 mt-1">Review and approve new user registrations</p>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200">
                <Clock className="w-5 h-5 text-amber-700" />
                <span className="text-amber-800 font-semibold">{pendingUsers.length} pending</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Registered</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {pendingUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center shadow-sm">
                              <span className="text-white font-bold text-lg">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-slate-900">{user.name}</div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 capitalize">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {user.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUserAction(user._id, 'verify')}
                              className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              <UserCheck size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter reason for rejection:');
                                if (reason) handleUserAction(user._id, 'block', reason);
                              }}
                              className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              <UserX size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">User Management</h2>
                <p className="text-slate-600 mt-1">Manage all registered users</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                  className="px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-medium"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="alumni">Alumni</option>
                  <option value="principal">Principal</option>
                </select>
                <select
                  value={filters.verificationStatus}
                  onChange={(e) => setFilters({...filters, verificationStatus: e.target.value})}
                  className="px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending_verification">Pending</option>
                  <option value="blocked">Blocked</option>
                </select>
                <button className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all shadow-sm">
                  <Filter size={18} className="inline mr-2" />
                  Apply
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {allUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                              {user.profileImage ? (
                                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-slate-600 flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-slate-900">{user.name}</div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'principal' ? 'bg-slate-700 text-white' :
                            user.role === 'teacher' ? 'bg-slate-600 text-white' :
                            user.role === 'alumni' ? 'bg-slate-500 text-white' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {user.department || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            user.verificationStatus === 'verified' ? 'bg-slate-100 text-slate-700' :
                            user.verificationStatus === 'pending_verification' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {user.verificationStatus === 'pending_verification' ? 'Pending' : 
                             user.verificationStatus === 'verified' ? 'Verified' : 'Blocked'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {user.verificationStatus === 'pending_verification' && (
                              <>
                                <button
                                  onClick={() => handleUserAction(user._id, 'verify')}
                                  className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Enter reason for rejection:');
                                    if (reason) handleUserAction(user._id, 'block', reason);
                                  }}
                                  className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {user.verificationStatus === 'verified' && user.role !== 'admin' && (
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter reason for blocking:');
                                  if (reason) handleUserAction(user._id, 'block', reason);
                                }}
                                className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                              >
                                Block
                              </button>
                            )}
                            {user.verificationStatus === 'blocked' && (
                              <button
                                onClick={() => handleUserAction(user._id, 'unblock')}
                                className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                              >
                                Unblock
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/profile/${user._id}`)}
                              className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                            >
                              <Eye size={14} className="inline" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Reported Content</h2>
                <p className="text-slate-600 mt-1">Review and moderate flagged posts</p>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-red-50 rounded-xl border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-700" />
                <span className="text-red-800 font-semibold">{reportedPosts.length} reports</span>
              </div>
            </div>

            <div className="space-y-4">
              {reportedPosts.map((post) => (
                <div key={post._id} className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-lg">
                          {post.author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{post.author.name}</p>
                        <p className="text-sm text-slate-500">{post.author.role} • {post.author.department}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePostAction(post._id, 'approve')}
                        className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                      >
                        <CheckCircle size={16} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handlePostAction(post._id, 'delete')}
                        className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-slate-800 font-medium">{post.content}</p>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      Reports ({post.reports.length})
                    </h4>
                    <div className="space-y-2">
                      {post.reports.map((report, index) => (
                        <div key={index} className="bg-red-50 p-4 rounded-xl border border-red-100">
                          <p className="text-sm text-red-900 font-semibold mb-1">
                            <strong>Reason:</strong> {report.reason}
                          </p>
                          <p className="text-xs text-red-700">
                            Reported by {report.reportedBy.name} on {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">System Settings</h2>
              <p className="text-slate-600 mt-1">Configure system preferences and integrations</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Status */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">System Status</h3>
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-slate-700" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-slate-700" />
                      <span className="text-sm font-semibold text-slate-700">Database</span>
                    </div>
                    <span className="px-3 py-1 bg-slate-700 text-white text-xs font-bold rounded-full">Connected</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-slate-700" />
                      <span className="text-sm font-semibold text-slate-700">Email Service</span>
                    </div>
                    <span className="px-3 py-1 bg-slate-700 text-white text-xs font-bold rounded-full">Operational</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-slate-700" />
                      <span className="text-sm font-semibold text-slate-700">Security</span>
                    </div>
                    <span className="px-3 py-1 bg-slate-700 text-white text-xs font-bold rounded-full">Active</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">System Info</h3>
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-slate-700" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">Server Uptime</span>
                    <span className="text-sm font-bold text-slate-900">24h 15m</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">Last Backup</span>
                    <span className="text-sm font-bold text-slate-900">2 hours ago</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">Version</span>
                    <span className="text-sm font-bold text-slate-900">v1.0.0</span>
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Bulk Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 group">
                    <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserCheck className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900">Approve All Pending</p>
                      <p className="text-sm text-slate-600">Verify all waiting users</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center space-x-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 group">
                    <div className="w-10 h-10 bg-slate-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900">Export User Data</p>
                      <p className="text-sm text-slate-600">Download CSV report</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center space-x-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 group">
                    <div className="w-10 h-10 bg-slate-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900">System Announcement</p>
                      <p className="text-sm text-slate-600">Notify all users</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 rounded-xl p-6 shadow-md border-2 border-red-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-red-900">Danger Zone</h3>
                </div>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-4 p-4 bg-white hover:bg-red-50 rounded-xl transition-all border-2 border-red-200">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <div className="text-left">
                      <p className="font-bold text-red-900">Clear All Reports</p>
                      <p className="text-sm text-red-700">Remove all content flags</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center space-x-4 p-4 bg-white hover:bg-red-50 rounded-xl transition-all border-2 border-red-200">
                    <RefreshCw className="w-5 h-5 text-red-600" />
                    <div className="text-left">
                      <p className="font-bold text-red-900">Reset System</p>
                      <p className="text-sm text-red-700">⚠️ Cannot be undone</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
