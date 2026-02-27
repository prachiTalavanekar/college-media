import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  FileText, 
  Calendar, 
  BarChart3, 
  Shield, 
  Upload,
  Download,
  Eye,
  UserPlus,
  UserMinus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const CommunityManagement = ({ communityId, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [community, setCommunity] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityData();
  }, [communityId]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const [communityRes, analyticsRes, materialsRes, assignmentsRes] = await Promise.all([
        api.get(`/communities/${communityId}`),
        api.get(`/communities/${communityId}/analytics`),
        api.get(`/communities/${communityId}/study-materials`),
        api.get(`/communities/${communityId}/assignments`)
      ]);

      setCommunity(communityRes.data.community);
      setAnalytics(analyticsRes.data.analytics);
      setStudyMaterials(materialsRes.data.materials);
      setAssignments(assignmentsRes.data.assignments);
      setJoinRequests(communityRes.data.community.joinRequests || []);
    } catch (error) {
      console.error('Error fetching community data:', error);
      toast.error('Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (userId) => {
    try {
      await api.post(`/communities/${communityId}/approve-request`, { userId });
      toast.success('Join request approved');
      fetchCommunityData();
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await api.post(`/communities/${communityId}/reject-request`, { userId });
      toast.success('Join request rejected');
      fetchCommunityData();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleRemoveMember = async (userId, reason) => {
    try {
      await api.post(`/communities/${communityId}/members/${userId}/remove`, { reason });
      toast.success('Member removed successfully');
      fetchCommunityData();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handlePromoteMember = async (userId, role) => {
    try {
      await api.post(`/communities/${communityId}/members/${userId}/promote`, { role });
      toast.success(`Member promoted to ${role}`);
      fetchCommunityData();
    } catch (error) {
      toast.error('Failed to promote member');
    }
  };

  const handleWarnMember = async (userId, reason) => {
    try {
      await api.post(`/communities/${communityId}/members/${userId}/warn`, { reason });
      toast.success('Warning issued successfully');
      fetchCommunityData();
    } catch (error) {
      toast.error('Failed to issue warning');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'requests', label: 'Join Requests', icon: UserPlus, badge: joinRequests.length },
    { id: 'materials', label: 'Study Materials', icon: FileText },
    { id: 'assignments', label: 'Assignments', icon: Calendar },
    { id: 'moderation', label: 'Moderation', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="loading-spinner h-8 w-8 mx-auto"></div>
          <p className="text-center mt-4">Loading community data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{community?.name}</h2>
            <p className="text-sm text-gray-500">Community Management</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <nav className="p-4 space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon size={18} />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </div>
                    {tab.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <OverviewTab analytics={analytics} community={community} />
            )}
            {activeTab === 'members' && (
              <MembersTab 
                community={community} 
                onRemoveMember={handleRemoveMember}
                onPromoteMember={handlePromoteMember}
                onWarnMember={handleWarnMember}
              />
            )}
            {activeTab === 'requests' && (
              <RequestsTab 
                requests={joinRequests}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
              />
            )}
            {activeTab === 'materials' && (
              <MaterialsTab 
                materials={studyMaterials}
                communityId={communityId}
                onRefresh={fetchCommunityData}
              />
            )}
            {activeTab === 'assignments' && (
              <AssignmentsTab 
                assignments={assignments}
                communityId={communityId}
                onRefresh={fetchCommunityData}
              />
            )}
            {activeTab === 'moderation' && (
              <ModerationTab analytics={analytics} />
            )}
            {activeTab === 'settings' && (
              <SettingsTab 
                community={community}
                onUpdate={fetchCommunityData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ analytics, community }) => (
  <div className="p-6 space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Community Overview</h3>
    
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Total Members</span>
        </div>
        <p className="text-2xl font-bold text-blue-900 mt-1">{analytics?.totalMembers || 0}</p>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-600">Active Members</span>
        </div>
        <p className="text-2xl font-bold text-green-900 mt-1">{analytics?.activeMembers || 0}</p>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-600">Posts</span>
        </div>
        <p className="text-2xl font-bold text-purple-900 mt-1">{analytics?.totalPosts || 0}</p>
      </div>
      
      <div className="bg-orange-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-orange-600" />
          <span className="text-sm font-medium text-orange-600">Assignments</span>
        </div>
        <p className="text-2xl font-bold text-orange-900 mt-1">{analytics?.totalAssignments || 0}</p>
      </div>
    </div>

    {/* Member Distribution */}
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-3">Member Distribution by Role</h4>
      <div className="space-y-2">
        {analytics?.membersByRole && Object.entries(analytics.membersByRole).map(([role, count]) => (
          <div key={role} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 capitalize">{role}</span>
            <span className="text-sm font-medium text-gray-900">{count}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Top Contributors */}
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-3">Top Contributors</h4>
      <div className="space-y-3">
        {analytics?.topContributors?.slice(0, 5).map((contributor, index) => (
          <div key={contributor.user._id} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {contributor.user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{contributor.user.name}</p>
              <p className="text-xs text-gray-500">
                {contributor.postsCount} posts, {contributor.commentsCount} comments
              </p>
            </div>
            <span className="text-xs text-gray-400">#{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Members Tab Component
const MembersTab = ({ community, onRemoveMember, onPromoteMember, onWarnMember }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');

  const handleAction = async () => {
    if (!selectedMember || !actionType) return;

    try {
      switch (actionType) {
        case 'remove':
          await onRemoveMember(selectedMember._id, reason);
          break;
        case 'promote_moderator':
          await onPromoteMember(selectedMember._id, 'moderator');
          break;
        case 'promote_admin':
          await onPromoteMember(selectedMember._id, 'admin');
          break;
        case 'warn':
          await onWarnMember(selectedMember._id, reason);
          break;
      }
      setSelectedMember(null);
      setActionType('');
      setReason('');
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Community Members</h3>
        <span className="text-sm text-gray-500">{community?.members?.length || 0} members</span>
      </div>

      <div className="space-y-3">
        {community?.members?.map(member => (
          <div key={member.user._id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                {member.user.profileImage ? (
                  <img 
                    src={member.user.profileImage} 
                    alt={member.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-semibold">
                    {member.user.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{member.user.name}</p>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    member.role === 'admin' ? 'bg-red-100 text-red-700' :
                    member.role === 'moderator' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {member.role}
                  </span>
                  <span className="text-xs text-gray-500">{member.user.role}</span>
                  {member.warnings?.length > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      {member.warnings.length} warning{member.warnings.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedMember(member.user);
                  setActionType('warn');
                }}
                className="text-yellow-600 hover:text-yellow-700 p-1"
                title="Issue Warning"
              >
                <AlertTriangle size={16} />
              </button>
              
              {member.role === 'member' && (
                <button
                  onClick={() => {
                    setSelectedMember(member.user);
                    setActionType('promote_moderator');
                  }}
                  className="text-blue-600 hover:text-blue-700 p-1"
                  title="Promote to Moderator"
                >
                  <UserPlus size={16} />
                </button>
              )}
              
              {community.creator !== member.user._id && (
                <button
                  onClick={() => {
                    setSelectedMember(member.user);
                    setActionType('remove');
                  }}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Remove Member"
                >
                  <UserMinus size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {actionType === 'remove' ? 'Remove Member' :
               actionType === 'warn' ? 'Issue Warning' :
               actionType === 'promote_moderator' ? 'Promote to Moderator' :
               actionType === 'promote_admin' ? 'Promote to Admin' : 'Action'}
            </h4>
            
            <p className="text-gray-600 mb-4">
              {actionType === 'remove' ? `Remove ${selectedMember.name} from the community?` :
               actionType === 'warn' ? `Issue a warning to ${selectedMember.name}?` :
               actionType === 'promote_moderator' ? `Promote ${selectedMember.name} to moderator?` :
               actionType === 'promote_admin' ? `Promote ${selectedMember.name} to admin?` : ''}
            </p>

            {(actionType === 'remove' || actionType === 'warn') && (
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (required)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                rows={3}
                required
              />
            )}

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedMember(null);
                  setActionType('');
                  setReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={(actionType === 'remove' || actionType === 'warn') && !reason.trim()}
                className={`px-4 py-2 rounded-lg text-white ${
                  actionType === 'remove' ? 'bg-red-600 hover:bg-red-700' :
                  actionType === 'warn' ? 'bg-yellow-600 hover:bg-yellow-700' :
                  'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Join Requests Tab Component
const RequestsTab = ({ requests, onApprove, onReject }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">Join Requests</h3>
    
    {requests.length === 0 ? (
      <div className="text-center py-8">
        <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No pending join requests</p>
      </div>
    ) : (
      <div className="space-y-3">
        {requests.map(request => (
          <div key={request.user._id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {request.user.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{request.user.name}</p>
                <p className="text-sm text-gray-500">{request.user.role} • {request.user.department}</p>
                {request.message && (
                  <p className="text-sm text-gray-600 mt-1">"{request.message}"</p>
                )}
                <p className="text-xs text-gray-400">
                  Requested {new Date(request.requestedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onApprove(request.user._id)}
                className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
              >
                <CheckCircle size={16} />
                <span className="text-sm">Approve</span>
              </button>
              <button
                onClick={() => onReject(request.user._id)}
                className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                <XCircle size={16} />
                <span className="text-sm">Reject</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Study Materials Tab Component
const MaterialsTab = ({ materials, communityId, onRefresh }) => {
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleUpload = async (formData) => {
    try {
      setUploading(true);
      await api.post(`/communities/${communityId}/study-materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Study material uploaded successfully');
      setShowUploadForm(false);
      onRefresh();
    } catch (error) {
      toast.error('Failed to upload study material');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Study Materials</h3>
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Upload size={16} />
          <span>Upload Material</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map(material => (
          <div key={material._id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{material.title}</h4>
                <p className="text-sm text-gray-600">{material.description}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                material.category === 'lecture' ? 'bg-blue-100 text-blue-700' :
                material.category === 'assignment' ? 'bg-red-100 text-red-700' :
                material.category === 'reference' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {material.category}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>By {material.uploadedBy.name}</span>
              <span>{new Date(material.uploadedAt).toLocaleDateString()}</span>
            </div>
            
            <div className="mt-3 flex items-center space-x-2">
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
              >
                <Download size={14} />
                <span className="text-sm">Download</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <UploadMaterialForm
          onSubmit={handleUpload}
          onClose={() => setShowUploadForm(false)}
          uploading={uploading}
        />
      )}
    </div>
  );
};

// Upload Material Form Component
const UploadMaterialForm = ({ onSubmit, onClose, uploading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'lecture',
    isPublic: true,
    file: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.file || !formData.title.trim()) {
      toast.error('Title and file are required');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('isPublic', formData.isPublic);
    data.append('file', formData.file);

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Upload Study Material</h4>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="lecture">Lecture</option>
              <option value="assignment">Assignment</option>
              <option value="reference">Reference</option>
              <option value="syllabus">Syllabus</option>
              <option value="notes">Notes</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
            <input
              type="file"
              onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.avi"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Make public to all members
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Assignments Tab Component
const AssignmentsTab = ({ assignments, communityId, onRefresh }) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <Calendar size={16} />
        <span>Create Assignment</span>
      </button>
    </div>

    <div className="space-y-4">
      {assignments.map(assignment => (
        <div key={assignment._id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">{assignment.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              new Date(assignment.dueDate) < new Date() 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Created by {assignment.createdBy.name}</span>
            <span>{assignment.submissions?.length || 0} submissions</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Moderation Tab Component
const ModerationTab = ({ analytics }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">Moderation Logs</h3>
    
    <div className="space-y-3">
      {analytics?.moderationLogs?.map((log, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${
            log.action === 'member_removed' ? 'bg-red-500' :
            log.action === 'warning_issued' ? 'bg-yellow-500' :
            log.action === 'member_promoted' ? 'bg-green-500' :
            'bg-blue-500'
          }`} />
          <div className="flex-1">
            <p className="text-sm text-gray-900">
              <span className="font-medium">{log.moderator.name}</span> {log.action.replace('_', ' ')} 
              <span className="font-medium"> {log.targetUser.name}</span>
            </p>
            {log.reason && (
              <p className="text-xs text-gray-500">Reason: {log.reason}</p>
            )}
            <p className="text-xs text-gray-400">
              {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Settings Tab Component
const SettingsTab = ({ community, onUpdate }) => {
  const [settings, setSettings] = useState({
    name: community?.name || '',
    description: community?.description || '',
    purpose: community?.purpose || '',
    isPrivate: community?.isPrivate || false,
    requiresApproval: community?.requiresApproval || false,
    academicSettings: community?.academicSettings || {}
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/communities/${community._id}/settings`, settings);
      toast.success('Settings updated successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Community Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Community Name</label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={settings.description}
            onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
          <textarea
            value={settings.purpose}
            onChange={(e) => setSettings(prev => ({ ...prev, purpose: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.isPrivate}
              onChange={(e) => setSettings(prev => ({ ...prev, isPrivate: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Private community</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.requiresApproval}
              onChange={(e) => setSettings(prev => ({ ...prev, requiresApproval: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Require approval for join requests</span>
          </label>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityManagement;