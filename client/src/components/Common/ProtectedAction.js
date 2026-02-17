import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Component that conditionally renders children based on user permissions
 * @param {string} action - Permission key to check
 * @param {React.ReactNode} children - Content to render if permission is granted
 * @param {React.ReactNode} fallback - Content to render if permission is denied
 */
const ProtectedAction = ({ action, children, fallback = null }) => {
  const { can } = usePermissions();
  
  if (can(action)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

/**
 * Component that conditionally renders children based on user role
 * @param {string|string[]} roles - Role(s) to check
 * @param {React.ReactNode} children - Content to render if role matches
 * @param {React.ReactNode} fallback - Content to render if role doesn't match
 */
export const ProtectedRole = ({ roles, children, fallback = null }) => {
  const { isRole, hasAnyRole } = usePermissions();
  
  const hasPermission = Array.isArray(roles) 
    ? hasAnyRole(roles) 
    : isRole(roles);
  
  if (hasPermission) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

/**
 * Higher-order component that wraps a component with permission check
 * @param {React.Component} Component - Component to wrap
 * @param {string} action - Permission key to check
 */
export const withPermission = (Component, action) => {
  return (props) => {
    const { can } = usePermissions();
    
    if (!can(action)) {
      return null;
    }
    
    return <Component {...props} />;
  };
};

/**
 * Higher-order component that wraps a component with role check
 * @param {React.Component} Component - Component to wrap
 * @param {string|string[]} roles - Role(s) to check
 */
export const withRole = (Component, roles) => {
  return (props) => {
    const { isRole, hasAnyRole } = usePermissions();
    
    const hasPermission = Array.isArray(roles) 
      ? hasAnyRole(roles) 
      : isRole(roles);
    
    if (!hasPermission) {
      return null;
    }
    
    return <Component {...props} />;
  };
};

export default ProtectedAction;
