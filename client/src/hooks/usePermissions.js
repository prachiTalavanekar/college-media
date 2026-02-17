import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserPermissions, canUserPerform, getRoleBadge } from '../utils/permissions';

/**
 * Custom hook for checking user permissions
 * @returns {Object} - Permissions and utility functions
 */
export const usePermissions = () => {
  const { user } = useAuth();
  
  const permissions = useMemo(() => {
    return getUserPermissions(user);
  }, [user]);
  
  const can = (action) => {
    return canUserPerform(user, action);
  };
  
  const badge = useMemo(() => {
    return getRoleBadge(user);
  }, [user]);
  
  const isRole = (role) => {
    return user?.role === role;
  };
  
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };
  
  return {
    permissions,
    can,
    badge,
    isRole,
    hasAnyRole,
    user
  };
};

export default usePermissions;
