import apiClient from '../api-client';

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  upload_limit_mb: number;
  priority: number;
  is_system_role: boolean;
  color: string;
  created_at: string;
  updated_at: string;
  user_count?: number;
  permission_count?: number;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  category: string;
  is_system_permission: boolean;
  created_at: string;
}

export interface UserRole {
  id: string;
  name: string;
  display_name: string;
  color: string;
  granted_at: string;
  granted_by_email?: string;
  granted_by_first_name?: string;
  granted_by_last_name?: string;
}

export const rolesService = {
  // Get all roles
  async getAllRoles(): Promise<Role[]> {
    const response = await apiClient.get('/roles');
    return response.data.roles;
  },

  // Get single role with permissions
  async getRole(id: string): Promise<Role> {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data.role;
  },

  // Create new role
  async createRole(data: {
    name: string;
    display_name: string;
    description?: string;
    upload_limit_mb?: number;
    priority?: number;
    color?: string;
    permissions?: string[];
  }): Promise<Role> {
    const response = await apiClient.post('/roles', data);
    return response.data.role;
  },

  // Update role
  async updateRole(
    id: string,
    data: {
      display_name?: string;
      description?: string;
      upload_limit_mb?: number;
      priority?: number;
      color?: string;
      permissions?: string[];
    }
  ): Promise<Role> {
    const response = await apiClient.put(`/roles/${id}`, data);
    return response.data.role;
  },

  // Delete role
  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  },

  // Get all permissions
  async getAllPermissions(): Promise<{
    permissions: Permission[];
    grouped: Record<string, Permission[]>;
  }> {
    const response = await apiClient.get('/roles/permissions/all');
    return {
      permissions: response.data.permissions,
      grouped: response.data.grouped,
    };
  },

  // Create new permission
  async createPermission(data: {
    name: string;
    display_name: string;
    description?: string;
    category: string;
  }): Promise<Permission> {
    const response = await apiClient.post('/roles/permissions', data);
    return response.data.permission;
  },

  // Update permission
  async updatePermission(
    id: string,
    data: {
      display_name?: string;
      description?: string;
      category?: string;
    }
  ): Promise<Permission> {
    const response = await apiClient.put(`/roles/permissions/${id}`, data);
    return response.data.permission;
  },

  // Delete permission
  async deletePermission(id: string): Promise<void> {
    await apiClient.delete(`/roles/permissions/${id}`);
  },

  // Get user roles
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const response = await apiClient.get(`/roles/user/${userId}`);
    return response.data.roles;
  },

  // Assign role to user
  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    await apiClient.post(`/roles/user/${userId}/assign`, { roleId });
  },

  // Remove role from user
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await apiClient.post(`/roles/user/${userId}/remove`, { roleId });
  },
};

export default rolesService;
