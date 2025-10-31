/**
 * Auth Service
 * Authentifizierungs-API
 */

import apiClient, { setTokens, clearTokens, getRefreshToken } from '../api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone?: string;
  mobile?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  member_number?: string;
  profile_image?: string;
  roles: string[];
  roleDetails?: Array<{ name: string; display_name: string }>;
  permissions: string[];
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// Login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  const { accessToken, refreshToken, user } = response.data;
  
  // Tokens speichern
  setTokens(accessToken, refreshToken);
  
  return response.data;
};

// Register
export const register = async (data: RegisterData): Promise<ApiResponse> => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

// Logout
export const logout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  
  // Nur API-Call wenn RefreshToken vorhanden (nicht im Dev-Mode)
  if (refreshToken) {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Fehler nur loggen, nicht werfen - Logout sollte immer funktionieren
      console.warn('Logout API-Call fehlgeschlagen (normal im Dev-Mode):', error);
    }
  }
  
  clearTokens();
};

// Logout auf allen Geräten
export const logoutAll = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout-all');
  } finally {
    clearTokens();
  }
};

// Aktuelle Benutzerinfo
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
  return response.data.user;
};

// Passwort-Reset anfordern
export const requestPasswordReset = async (email: string): Promise<ApiResponse> => {
  const response = await apiClient.post('/auth/request-password-reset', { email });
  return response.data;
};

// Passwort zurücksetzen
export const resetPassword = async (token: string, newPassword: string): Promise<ApiResponse> => {
  const response = await apiClient.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

// Passwort ändern (eingeloggt)
export const changePassword = async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
  const response = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};
