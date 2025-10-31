import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface PermissionsContextType {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (roleName: string) => boolean;
  maxUploadMb: number;
  permissions: string[];
  roles: Array<{ name: string; id: string }>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Old admin system compatibility - admins have all permissions
    if (user.is_admin) return true;
    
    // Check RBAC permissions
    return user.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.is_admin) return true;
    
    return permissions.some(permission => user.permissions?.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.is_admin) return true;
    
    return permissions.every(permission => user.permissions?.includes(permission));
  };

  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    
    return user.roles?.some(role => role.name === roleName) || false;
  };

  const value: PermissionsContextType = {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    maxUploadMb: user?.maxUploadMb || 5,
    permissions: user?.permissions || [],
    roles: user?.roles || [],
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

// Utility component to conditionally render based on permission
export const RequirePermission: React.FC<{
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ permission, children, fallback = null }) => {
  const { hasPermission } = usePermissions();
  
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
};

// Utility component to conditionally render based on any permission
export const RequireAnyPermission: React.FC<{
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ permissions, children, fallback = null }) => {
  const { hasAnyPermission } = usePermissions();
  
  return hasAnyPermission(permissions) ? <>{children}</> : <>{fallback}</>;
};

// Utility component to conditionally render based on role
export const RequireRole: React.FC<{
  role: string;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ role, children, fallback = null }) => {
  const { hasRole } = usePermissions();
  
  return hasRole(role) ? <>{children}</> : <>{fallback}</>;
};

export default PermissionsContext;
