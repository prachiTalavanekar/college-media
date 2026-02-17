import React from 'react';
import { getRoleBadge } from '../../utils/permissions';

/**
 * Component that displays a user's role badge
 * @param {Object} user - User object
 * @param {string} size - Badge size: 'sm', 'md', 'lg'
 * @param {boolean} showIcon - Whether to show the icon
 */
const RoleBadge = ({ user, size = 'md', showIcon = true }) => {
  if (!user) return null;
  
  const badge = getRoleBadge(user);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${badge.color} ${sizeClasses[size]}`}>
      {showIcon && <span className="mr-1">{badge.icon}</span>}
      {badge.label}
    </span>
  );
};

/**
 * Component that displays multiple badges for a user (role + special badges)
 * @param {Object} user - User object
 * @param {string} size - Badge size
 */
export const UserBadges = ({ user, size = 'sm' }) => {
  if (!user) return null;
  
  const badges = [];
  
  // Main role badge
  badges.push({
    key: 'role',
    ...getRoleBadge(user)
  });
  
  // Alumni-specific badges
  if (user.role === 'alumni') {
    if (user.verified_recruiter) {
      badges.push({
        key: 'recruiter',
        label: 'Verified Recruiter',
        color: 'bg-orange-100 text-orange-800',
        icon: '✓'
      });
    }
  }
  
  // Teacher-specific badges
  if (user.role === 'teacher' && user.department_head) {
    badges.push({
      key: 'dept-head',
      label: 'Dept. Head',
      color: 'bg-teal-100 text-teal-800',
      icon: '⭐'
    });
  }
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((badge) => (
        <span 
          key={badge.key}
          className={`inline-flex items-center rounded-full font-medium ${badge.color} ${sizeClasses[size]}`}
        >
          {badge.icon && <span className="mr-1">{badge.icon}</span>}
          {badge.label}
        </span>
      ))}
    </div>
  );
};

export default RoleBadge;
