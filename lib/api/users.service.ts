/**
 * Users/Members Service
 * API für Mitgliederverwaltung
 */

import apiClient from '../api-client';
import { User } from './auth.service';

export interface Member extends User {
  member_number?: string;
  phone?: string;
  mobile?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  membership_status: 'active' | 'passive' | 'honorary' | 'youth' | 'trial' | 'inactive';
  membership_start_date?: string;
  membership_end_date?: string;
  is_youth: boolean;
  parent1_first_name?: string;
  parent1_last_name?: string;
  parent1_email?: string;
  parent1_phone?: string;
  show_in_member_list: boolean;
  show_email: boolean;
  show_phone: boolean;
  email_notifications: boolean;
  notify_news: boolean;
  notify_events: boolean;
  notify_own_activities: boolean;
  notes?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  mobile?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  showInMemberList?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  emailNotifications?: boolean;
  notifyNews?: boolean;
  notifyEvents?: boolean;
  notifyOwnActivities?: boolean;
}

// Alle Mitglieder abrufen
export const getAllMembers = async (params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get<{
    success: boolean;
    members: Member[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>('/users', { params });
  return response.data;
};

// Mitglied nach ID
export const getMemberById = async (id: number) => {
  const response = await apiClient.get<{ success: boolean; member: Member }>(`/users/${id}`);
  return response.data.member;
};

// Eigenes Profil
export const getMyProfile = async () => {
  const response = await apiClient.get<{ success: boolean; member: Member }>('/users/me');
  return response.data.member;
};

// Eigenes Profil aktualisieren
export const updateMyProfile = async (data: UpdateProfileData) => {
  const response = await apiClient.put<{ success: boolean; message: string; user: Member }>(
    '/users/me',
    data
  );
  return response.data;
};

// Profilbild hochladen
export const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append('profileImage', file);

  const response = await apiClient.post<{
    success: boolean;
    message: string;
    imagePath: string;
  }>('/users/me/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Mitglied aktualisieren (Admin/Vorstand)
export const updateMember = async (id: number, data: Partial<Member>) => {
  const response = await apiClient.put<{ success: boolean; message: string; member: Member }>(
    `/users/${id}`,
    data
  );
  return response.data;
};

// Neues Mitglied anlegen (Admin/Vorstand)
export const createMember = async (data: Partial<Member> & { password: string }) => {
  const response = await apiClient.post<{ success: boolean; message: string; userId: number }>(
    '/users',
    data
  );
  return response.data;
};

// Mitglied deaktivieren
export const deactivateMember = async (id: number) => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/users/${id}/deactivate`
  );
  return response.data;
};

// Mitglied löschen
export const deleteMember = async (id: number) => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/users/${id}`);
  return response.data;
};

// Statistiken
export const getMemberStats = async () => {
  const response = await apiClient.get<{
    success: boolean;
    stats: {
      total: number;
      active: number;
      youth: number;
      passive: number;
      new_this_month: number;
    };
  }>('/users/stats');
  return response.data.stats;
};
