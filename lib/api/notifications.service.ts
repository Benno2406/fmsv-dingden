/**
 * Notifications Service
 * API für Benachrichtigungen
 */

import apiClient from '../api-client';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  related_type?: string;
  related_id?: number;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// Eigene Benachrichtigungen
export const getMyNotifications = async (params?: { limit?: number; unreadOnly?: boolean }) => {
  const response = await apiClient.get<{ success: boolean; notifications: Notification[] }>(
    '/notifications',
    { params }
  );
  return response.data.notifications;
};

// Anzahl ungelesener
export const getUnreadCount = async () => {
  const response = await apiClient.get<{ success: boolean; count: number }>(
    '/notifications/unread/count'
  );
  return response.data.count;
};

// Als gelesen markieren
export const markAsRead = async (id: number) => {
  const response = await apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`);
  return response.data;
};

// Alle als gelesen markieren
export const markAllAsRead = async () => {
  const response = await apiClient.patch<{ success: boolean }>('/notifications/mark-all-read');
  return response.data;
};

// Benachrichtigung löschen
export const deleteNotification = async (id: number) => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `/notifications/${id}`
  );
  return response.data;
};

// Alle Benachrichtigungen löschen
export const deleteAllNotifications = async () => {
  const response = await apiClient.delete<{ success: boolean; message: string }>('/notifications');
  return response.data;
};
