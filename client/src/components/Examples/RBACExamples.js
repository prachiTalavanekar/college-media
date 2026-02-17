/**
 * RBAC Usage Examples
 * This file demonstrates how to use the Role-Based Access Control system
 * in various scenarios throughout the application.
 */

import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import ProtectedAction, { ProtectedRole } from '../Common/ProtectedAction';
import RoleBadge, { UserBadges } from '../Common/RoleBadge';

/**
 * Example 1: Simple Permission Check
 * Show/hide button based on permission
 */
export const CreateCommunityButton = () => {
  const { can } = usePermissions();
  
  if (!can('canCreateCommunity')) {
    return null;
  }
  
  return (
    <button className="btn btn-primary">
      Create Community
    </button>
  );
};

/**
 * Example 2: Using ProtectedAction Component
 * Cleaner way to conditionally render based on permissions
 */
export const PostActions = ({ post, onEdit, onDelete, onPin }) => {
  return (
    <div className="flex space-x-2">
      {/* Everyone can see their own edit button */}
      <button onClick={onEdit}>Edit</button>
      
      {/* Only users with permission can edit others' posts */}
      <ProtectedAction action="canEditOthersPosts">
        <button onClick={onEdit}>Edit (Admin)</button>
      </ProtectedAction>
      
      {/* Only users with permission can delete posts */}
      <ProtectedAction action="canDeleteOthersPosts">
        <button onClick={onDelete} className="text-red-600">
          Delete
        </button>
      </ProtectedAction>
      
      {/* Only teachers and above can pin posts */}
      <ProtectedAction action="canPinPosts">
        <button onClick={onPin}>Pin Post</button>
      </ProtectedAction>
    </div>
  );
};

/**
 * Example 3: Role-Based Rendering
 * Show different content based on user role
 */
export const DashboardContent = () => {
  return (
    <div>
      {/* Content for students */}
      <ProtectedRole roles="student">
        <div className="student-dashboard">
          <h2>Student Dashboard</h2>
          <p>View your courses, assignments, and opportunities</p>
        </div>
      </ProtectedRole>
      
      {/* Content for alumni */}
      <ProtectedRole roles="alumni">
        <div className="alumni-dashboard">
          <h2>Alumni Dashboard</h2>
          <p>Post opportunities and mentor students</p>
        </div>
      </ProtectedRole>
      
      {/* Content for teachers and principals */}
      <ProtectedRole roles={['teacher', 'principal']}>
        <div className="teacher-dashboard">
          <h2>Faculty Dashboard</h2>
          <p>Manage communities and post announcements</p>
        </div>
      </ProtectedRole>
      
      {/* Content for admins only */}
      <ProtectedRole roles="admin">
        <div className="admin-dashboard">
          <h2>Admin Dashboard</h2>
          <p>Manage users, verify accounts, and system settings</p>
        </div>
      </ProtectedRole>
    </div>
  );
};

/**
 * Example 4: Multiple Permission Checks
 * Complex logic with multiple permissions
 */
export const CreatePostForm = () => {
  const { can, isRole } = usePermissions();
  
  const canPostAnnouncement = can('canPostAnnouncement');
  const canPostOpportunity = can('canPostOpportunities');
  const canUploadResources = can('canUploadAcademicResources');
  
  return (
    <div className="create-post-form">
      <h3>Create New Post</h3>
      
      {/* Post type selector */}
      <select>
        <option value="regular">Regular Post</option>
        
        {canPostAnnouncement && (
          <option value="announcement">Announcement</option>
        )}
        
        {canPostOpportunity && (
          <option value="opportunity">Job/Internship</option>
        )}
        
        {canUploadResources && (
          <option value="resource">Academic Resource</option>
        )}
      </select>
      
      {/* Show special options for teachers */}
      {isRole('teacher') && (
        <div className="teacher-options">
          <label>
            <input type="checkbox" />
            Pin this post
          </label>
          <label>
            <input type="checkbox" />
            Highlight this post
          </label>
        </div>
      )}
    </div>
  );
};

/**
 * Example 5: Displaying User Badges
 * Show role badges on user profiles and posts
 */
export const UserCard = ({ user }) => {
  return (
    <div className="user-card">
      <img src={user.profileImage} alt={user.name} />
      <div>
        <h4>{user.name}</h4>
        <p>{user.department} • {user.course}</p>
        
        {/* Single role badge */}
        <RoleBadge user={user} size="sm" />
        
        {/* Or all badges (role + special badges) */}
        <UserBadges user={user} size="sm" />
      </div>
    </div>
  );
};

/**
 * Example 6: Conditional Navigation Items
 * Show different menu items based on permissions
 */
export const NavigationMenu = () => {
  const { can, isRole } = usePermissions();
  
  return (
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/communities">Communities</a></li>
        
        {can('canCreatePosts') && (
          <li><a href="/create">Create Post</a></li>
        )}
        
        {can('canViewOpportunityDashboard') && (
          <li><a href="/opportunities">Opportunities</a></li>
        )}
        
        {can('canViewMentorshipRequests') && (
          <li><a href="/mentorship">Mentorship Requests</a></li>
        )}
        
        {can('canAccessAdminDashboard') && (
          <li><a href="/admin">Admin Panel</a></li>
        )}
        
        {can('canViewPlatformAnalytics') && (
          <li><a href="/analytics">Analytics</a></li>
        )}
      </ul>
    </nav>
  );
};

/**
 * Example 7: Permission-Based Form Fields
 * Show/hide form fields based on permissions
 */
export const CommunityForm = () => {
  const { can } = usePermissions();
  
  return (
    <form>
      <input type="text" placeholder="Community Name" required />
      <textarea placeholder="Description" required />
      
      {/* Only teachers can set community as restricted */}
      {can('canManageCommunities') && (
        <label>
          <input type="checkbox" name="restricted" />
          Restricted (Requires approval to join)
        </label>
      )}
      
      {/* Only principals can make college-wide communities */}
      {can('canPostCollegeWideAnnouncements') && (
        <label>
          <input type="checkbox" name="collegeWide" />
          College-wide community
        </label>
      )}
      
      <button type="submit">Create Community</button>
    </form>
  );
};

/**
 * Example 8: Fallback Content
 * Show alternative content when permission is denied
 */
export const OpportunitySection = () => {
  return (
    <ProtectedAction 
      action="canPostOpportunities"
      fallback={
        <div className="text-gray-500">
          <p>Only alumni and faculty can post opportunities.</p>
          <p>Become an alumni to unlock this feature!</p>
        </div>
      }
    >
      <button className="btn btn-primary">
        Post New Opportunity
      </button>
    </ProtectedAction>
  );
};

/**
 * Example 9: Using Permissions in Event Handlers
 * Check permissions before performing actions
 */
export const PostComponent = ({ post }) => {
  const { can, user } = usePermissions();
  
  const handleDelete = () => {
    // Check if user can delete this post
    const canDelete = can('canDeleteAnyPost') || post.authorId === user?.id;
    
    if (!canDelete) {
      alert('You do not have permission to delete this post');
      return;
    }
    
    // Proceed with deletion
    console.log('Deleting post...');
  };
  
  const handleEdit = () => {
    const canEdit = can('canEditAnyPost') || post.authorId === user?.id;
    
    if (!canEdit) {
      alert('You do not have permission to edit this post');
      return;
    }
    
    console.log('Editing post...');
  };
  
  return (
    <div className="post">
      <p>{post.content}</p>
      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

/**
 * Example 10: Complex Permission Logic
 * Combine multiple permission checks
 */
export const MessageButton = ({ recipientUser }) => {
  const { can, isRole, user } = usePermissions();
  
  // Determine if current user can message the recipient
  const canMessage = () => {
    // Admins don't participate socially
    if (isRole('admin')) return false;
    
    // Check based on recipient role
    if (recipientUser.role === 'student') {
      return can('canMessageStudents');
    }
    
    if (recipientUser.role === 'alumni') {
      return can('canMessageAlumni');
    }
    
    if (recipientUser.role === 'teacher') {
      return can('canMessageTeachers');
    }
    
    return false;
  };
  
  if (!canMessage()) {
    return (
      <div className="text-gray-500 text-sm">
        Messaging not available
      </div>
    );
  }
  
  return (
    <button className="btn btn-primary">
      Send Message
    </button>
  );
};

/**
 * Example 11: Permission-Based Styling
 * Apply different styles based on permissions
 */
export const PostCard = ({ post }) => {
  const { can, badge } = usePermissions();
  
  const cardClasses = `
    post-card 
    ${can('canPinPosts') ? 'hover:border-blue-500' : ''}
    ${can('canHighlightPosts') ? 'cursor-pointer' : ''}
  `;
  
  return (
    <div className={cardClasses}>
      <div className="post-header">
        <span>{post.author.name}</span>
        <RoleBadge user={post.author} size="sm" />
      </div>
      <div className="post-content">
        {post.content}
      </div>
    </div>
  );
};

export default {
  CreateCommunityButton,
  PostActions,
  DashboardContent,
  CreatePostForm,
  UserCard,
  NavigationMenu,
  CommunityForm,
  OpportunitySection,
  PostComponent,
  MessageButton,
  PostCard
};
