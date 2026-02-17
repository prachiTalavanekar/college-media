/**
 * Role-Based Access Control (RBAC) Utility
 * Defines permissions for each role in the CampusConnect platform
 */

/**
 * Get permissions for a given user
 * @param {Object} user - User object with role and flags
 * @returns {Object} - Permissions object
 */
export const getUserPermissions = (user) => {
  if (!user) return getGuestPermissions();
  
  const role = user.role;
  
  // Base permissions for all authenticated users
  const basePermissions = {
    canViewPosts: true,
    canComment: true,
    canLike: true,
    canShareInternally: true,
    canSavePosts: true,
    canReportPosts: true,
    canViewEvents: true,
    canRSVPEvents: true,
    canFollowUsers: true,
    canViewAcademicResources: true,
    canViewProfile: true,
    canEditOwnProfile: true
  };
  
  switch (role) {
    case 'student':
      return getStudentPermissions(basePermissions);
    case 'alumni':
      return getAlumniPermissions(basePermissions, user);
    case 'teacher':
      return getTeacherPermissions(basePermissions, user);
    case 'principal':
      return getPrincipalPermissions(basePermissions);
    case 'admin':
      return getAdminPermissions(basePermissions);
    default:
      return basePermissions;
  }
};

/**
 * Guest/Unauthenticated user permissions
 */
const getGuestPermissions = () => ({
  canViewPosts: false,
  canComment: false,
  canLike: false,
  canViewEvents: false,
  canViewProfile: false
});

/**
 * Student permissions
 */
const getStudentPermissions = (base) => ({
  ...base,
  // Can do
  canCreatePosts: true,
  canCreatePostsInCommunities: true,
  canJoinOpenCommunities: true,
  canRequestJoinRestrictedCommunities: true,
  canApplyToOpportunities: true,
  canMessageAlumni: true,
  canMessageTeachers: false, // Configurable by admin
  canMessageStudents: false, // Configurable by admin
  canViewStudentProfiles: true,
  canViewAlumniProfiles: true,
  canViewTeacherProfiles: true,
  
  // Cannot do
  canCreateCommunity: false,
  canPostAnnouncement: false,
  canUploadAcademicResources: false,
  canApproveUsers: false,
  canEditOthersPosts: false,
  canDeleteOthersPosts: false,
  canBroadcastMessages: false,
  canPostOpportunities: false,
  canModerateCommunity: false,
  canPinPosts: false,
  canCreatePolls: false,
  canVerifyUsers: false,
  canBlockUsers: false,
  canAccessAnalytics: false,
  canAccessAdminDashboard: false
});

/**
 * Alumni permissions
 */
const getAlumniPermissions = (base, user) => ({
  ...base,
  // Can do
  canCreatePosts: true,
  canJoinOpenCommunities: true,
  canJoinAlumniCommunities: true,
  canPostOpportunities: true,
  canUploadStudyMaterials: true,
  canPostCareerGuidance: true,
  canOfferMentorship: user?.mentor || false,
  canMessageStudents: true,
  canMessageTeachers: true,
  canMessageAlumni: true,
  canViewOpportunityDashboard: true,
  canViewMentorshipRequests: user?.mentor || false,
  canViewStudentProfiles: true, // Limited info
  canViewAlumniProfiles: true,
  canViewTeacherProfiles: true,
  
  // Special badges
  hasMentorBadge: user?.mentor || false,
  hasRecruiterBadge: user?.verified_recruiter || false,
  
  // Cannot do
  canPostAnnouncement: false,
  canVerifyUsers: false,
  canCreateCommunity: false,
  canEditAdminPosts: false,
  canEditTeacherPosts: false,
  canAccessAdminDashboard: false,
  canModerateCommunity: false,
  canPinPosts: false,
  canApproveUsers: false,
  canBlockUsers: false,
  canAccessSystemAnalytics: false
});

/**
 * Teacher permissions
 */
const getTeacherPermissions = (base, user) => ({
  ...base,
  // Can do
  canCreatePosts: true,
  canCreateCommunity: true,
  canManageCommunities: true,
  canPostAnnouncement: true,
  canPostBlogs: true,
  canPostEvents: true,
  canPostReels: true,
  canUploadAcademicResources: true,
  canPinPosts: true,
  canModerateComments: true,
  canApproveCommunityRequests: true,
  canMessageStudents: true,
  canMessageAlumni: true,
  canMessageTeachers: true,
  canCreatePolls: true,
  canHighlightPosts: true,
  canViewDepartmentAnalytics: user?.department_head || false,
  canViewCommunityStats: true,
  canJoinAllCommunities: true,
  canViewStudentProfiles: true,
  canViewAlumniProfiles: true,
  canViewTeacherProfiles: true,
  canModerateCommunity: true,
  
  // Special badges
  hasTeacherBadge: user?.teacher_verified || true,
  isDepartmentHead: user?.department_head || false,
  
  // Cannot do
  canVerifyUsers: false,
  canBlockUsersPlatformWide: false,
  canModifySystemPermissions: false,
  canDeleteAdminPosts: false,
  canAccessAdminDashboard: false,
  canChangeUserRoles: false
});

/**
 * Principal permissions (elevated teacher)
 */
const getPrincipalPermissions = (base) => ({
  ...base,
  // Can do everything a teacher can, plus:
  canCreatePosts: true,
  canCreateCommunity: true,
  canManageCommunities: true,
  canPostAnnouncement: true,
  canPostCollegeWideAnnouncements: true,
  canPostBlogs: true,
  canPostEvents: true,
  canPostReels: true,
  canUploadAcademicResources: true,
  canPinPosts: true,
  canCreateFeaturedPosts: true,
  canModerateComments: true,
  canApproveCommunityRequests: true,
  canApproveEvents: true,
  canMessageStudents: true,
  canMessageAlumni: true,
  canMessageTeachers: true,
  canCreatePolls: true,
  canHighlightPosts: true,
  canViewPlatformAnalytics: true,
  canViewDepartmentAnalytics: true,
  canViewCommunityStats: true,
  canSendEmergencyNotifications: true,
  canJoinAllCommunities: true,
  canViewStudentProfiles: true,
  canViewAlumniProfiles: true,
  canViewTeacherProfiles: true,
  canModerateCommunity: true,
  
  // Cannot do
  canVerifyUsers: false,
  canBlockUsersPlatformWide: false,
  canModifySystemPermissions: false,
  canAccessAdminDashboard: false,
  canChangeUserRoles: false
});

/**
 * Admin permissions (super user)
 */
const getAdminPermissions = (base) => ({
  ...base,
  // Can do (system management)
  canVerifyUsers: true,
  canChangeUserRoles: true,
  canBlockUsers: true,
  canSuspendUsers: true,
  canApproveContent: true,
  canRemoveContent: true,
  canHandleReports: true,
  canEnableDisableFeatures: true,
  canControlMessagingRules: true,
  canAccessLogs: true,
  canAccessAuditTrail: true,
  canAccessAdminDashboard: true,
  canViewAllAnalytics: true,
  canModifySystemPermissions: true,
  canManageAllCommunities: true,
  canDeleteAnyPost: true,
  canEditAnyPost: true,
  canBroadcastMessages: true,
  canCreateAnnouncements: true,
  canViewAllProfiles: true,
  
  // Admins don't participate socially
  canCreatePosts: false,
  canComment: false,
  canLike: false,
  canShareInternally: false
});

/**
 * Check if user can perform a specific action
 * @param {Object} user - User object
 * @param {string} action - Permission key to check
 * @returns {boolean}
 */
export const canUserPerform = (user, action) => {
  const permissions = getUserPermissions(user);
  return permissions[action] || false;
};

/**
 * Get role badge configuration
 * @param {Object} user - User object
 * @returns {Object} - Badge configuration
 */
export const getRoleBadge = (user) => {
  if (!user) return null;
  
  const badges = {
    student: {
      label: 'Student',
      color: 'bg-blue-100 text-blue-800',
      icon: '🎓'
    },
    alumni: {
      label: user.mentor ? 'Alumni Mentor' : 'Alumni',
      color: 'bg-purple-100 text-purple-800',
      icon: user.mentor ? '🎯' : '🎓'
    },
    teacher: {
      label: user.department_head ? 'Dept. Head' : 'Teacher',
      color: 'bg-green-100 text-green-800',
      icon: '👨‍🏫'
    },
    principal: {
      label: 'Principal',
      color: 'bg-indigo-100 text-indigo-800',
      icon: '👔'
    },
    admin: {
      label: 'Admin',
      color: 'bg-red-100 text-red-800',
      icon: '⚙️'
    }
  };
  
  return badges[user.role] || badges.student;
};

/**
 * Get visible profile fields based on viewer's role
 * @param {Object} profileUser - User whose profile is being viewed
 * @param {Object} viewerUser - User viewing the profile
 * @returns {Object} - Visible fields configuration
 */
export const getVisibleProfileFields = (profileUser, viewerUser) => {
  const isOwnProfile = profileUser._id === viewerUser?._id;
  const viewerPermissions = getUserPermissions(viewerUser);
  
  return {
    name: true,
    role: true,
    department: true,
    course: true,
    batch: profileUser.role !== 'admin',
    profileImage: true,
    bio: true,
    interests: true,
    skills: true,
    
    // Conditional fields
    collegeId: isOwnProfile || viewerUser?.role === 'admin',
    contactNumber: isOwnProfile || (profileUser.showContactNumber && viewerPermissions.canViewProfile),
    email: isOwnProfile || viewerUser?.role === 'admin',
    currentYear: profileUser.role === 'student',
    currentSemester: profileUser.role === 'student',
    graduationYear: profileUser.role === 'alumni',
    currentCompany: profileUser.role === 'alumni',
    jobTitle: profileUser.role === 'alumni',
    
    // Admin-only fields
    verificationStatus: viewerUser?.role === 'admin',
    blockReason: viewerUser?.role === 'admin',
    lastActive: viewerUser?.role === 'admin' || viewerUser?.role === 'principal'
  };
};

export default {
  getUserPermissions,
  canUserPerform,
  getRoleBadge,
  getVisibleProfileFields
};
