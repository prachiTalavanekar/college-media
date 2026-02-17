// Admin Panel Configuration
// This file contains all admin-specific settings and constants

const adminConfig = {
  // Panel Information
  panelName: process.env.ADMIN_PANEL_NAME || 'CampusConnect Admin Panel',
  version: '1.0.0',
  
  // Authentication
  sessionTimeout: process.env.ADMIN_SESSION_TIMEOUT || '24h',
  jwtSecret: process.env.ADMIN_JWT_SECRET || 'campusconnect_admin_secret_2026',
  
  // API Configuration
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // Admin Credentials (from environment)
  defaultAdmin: {
    email: process.env.ADMIN_EMAIL || 'prachi@admin.com',
    password: process.env.ADMIN_PASSWORD || 'prachi1234'
  },
  
  // Feature Flags
  features: {
    bulkActions: process.env.ENABLE_BULK_ACTIONS === 'true',
    emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    userExport: process.env.ENABLE_USER_EXPORT === 'true',
    systemLogs: process.env.ENABLE_SYSTEM_LOGS === 'true'
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100]
  },
  
  // User Management
  userManagement: {
    allowedRoles: ['student', 'alumni', 'teacher', 'principal', 'admin'],
    verificationStatuses: ['pending_verification', 'verified', 'blocked'],
    defaultRole: 'student'
  },
  
  // Content Moderation
  moderation: {
    reportReasons: [
      'Spam',
      'Inappropriate Content',
      'Harassment',
      'False Information',
      'Copyright Violation',
      'Other'
    ],
    autoFlagThreshold: 5 // Auto-flag after 5 reports
  },
  
  // Email Configuration
  email: {
    notificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@campusconnect.com',
    sendVerificationEmails: true,
    sendRejectionEmails: true
  },
  
  // Security
  security: {
    rateLimit: parseInt(process.env.ADMIN_RATE_LIMIT) || 100,
    enableAuditLog: true,
    requireStrongPassword: true,
    sessionInactivityTimeout: 30 * 60 * 1000 // 30 minutes
  },
  
  // Dashboard
  dashboard: {
    refreshInterval: 60000, // 1 minute
    showRecentActivity: true,
    activityDays: 7, // Show last 7 days
    topDepartmentsCount: 5
  },
  
  // Export
  export: {
    formats: ['csv', 'json', 'xlsx'],
    maxRecords: 10000,
    includeFields: [
      'name',
      'email',
      'role',
      'department',
      'course',
      'batch',
      'verificationStatus',
      'createdAt'
    ]
  },
  
  // Theme
  theme: {
    primaryColor: '#1e293b', // slate-800
    secondaryColor: '#475569', // slate-600
    accentColor: '#3b82f6', // blue-600
    dangerColor: '#dc2626', // red-600
    successColor: '#16a34a', // green-600
    warningColor: '#f59e0b' // amber-500
  },
  
  // Departments (for filtering)
  departments: [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Other'
  ],
  
  // Courses (for filtering)
  courses: [
    'B.Tech',
    'M.Tech',
    'B.Sc',
    'M.Sc',
    'BCA',
    'MCA',
    'MBA',
    'Other'
  ]
};

// Validation function
adminConfig.validate = () => {
  const required = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing admin environment variables: ${missing.join(', ')}`);
    console.warn('⚠️  Using default values. Please configure admin/.env for production!');
  }
  
  return missing.length === 0;
};

// Helper functions
adminConfig.helpers = {
  // Check if user has admin role
  isAdmin: (user) => {
    return user && user.role === 'admin';
  },
  
  // Format date for display
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },
  
  // Format date with time
  formatDateTime: (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  // Get role badge color
  getRoleBadgeColor: (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      principal: 'bg-indigo-100 text-indigo-800',
      teacher: 'bg-green-100 text-green-800',
      alumni: 'bg-purple-100 text-purple-800',
      student: 'bg-blue-100 text-blue-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  },
  
  // Get status badge color
  getStatusBadgeColor: (status) => {
    const colors = {
      verified: 'bg-green-100 text-green-800',
      pending_verification: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
};

module.exports = adminConfig;
