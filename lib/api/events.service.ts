/**
 * Events Service
 * API für Termine/Veranstaltungen
 */

import apiClient from '../api-client';

export interface Event {
  id: number;
  created_by: number;
  creator_first_name: string;
  creator_last_name: string;
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_all_day: boolean;
  event_type: 'meeting' | 'training' | 'competition' | 'event' | 'maintenance' | 'other';
  category?: string;
  is_public: boolean;
  is_member_only: boolean;
  max_participants?: number;
  registration_deadline?: string;
  is_cancelled: boolean;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isAllDay?: boolean;
  eventType?: Event['event_type'];
  category?: string;
  isPublic?: boolean;
  isMemberOnly?: boolean;
  maxParticipants?: number;
  registrationDeadline?: string;
}

// Alle Events
export const getAllEvents = async (params?: {
  type?: string;
  startDate?: string;
  endDate?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get<{ success: boolean; events: Event[] }>('/events', {
    params,
  });
  return response.data.events;
};

// Kommende Events
export const getUpcomingEvents = async (limit = 10) => {
  const response = await apiClient.get<{ success: boolean; events: Event[] }>('/events/upcoming', {
    params: { limit },
  });
  return response.data.events;
};

// Event nach ID
export const getEventById = async (id: number) => {
  const response = await apiClient.get<{ success: boolean; event: Event }>(`/events/${id}`);
  return response.data.event;
};

// Event erstellen
export const createEvent = async (data: CreateEventData) => {
  const response = await apiClient.post<{ success: boolean; message: string; eventId: number }>(
    '/events',
    data
  );
  return response.data;
};

// Event aktualisieren
export const updateEvent = async (id: number, data: Partial<CreateEventData>) => {
  const response = await apiClient.put<{ success: boolean; message: string }>(`/events/${id}`, data);
  return response.data;
};

// Event absagen
export const cancelEvent = async (id: number, reason?: string) => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/events/${id}/cancel`,
    { reason }
  );
  return response.data;
};

// Event löschen
export const deleteEvent = async (id: number) => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/events/${id}`);
  return response.data;
};
