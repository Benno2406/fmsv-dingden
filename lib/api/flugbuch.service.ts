/**
 * Flugbuch Service
 * API für digitales Flugbuch
 */

import apiClient from '../api-client';

export interface FlugbuchEntry {
  id: number;
  user_id: number;
  flight_date: string;
  flight_time?: string;
  end_time?: string;
  duration: number;
  model_name: string;
  model_type?: string;
  model_weight?: number;
  flight_type: 'training' | 'fun' | 'competition' | 'test' | 'demonstration';
  location?: string;
  weather_conditions?: string;
  wind_speed?: string;
  temperature?: number;
  notes?: string;
  issues?: string;
  instructor_id?: number;
  instructor_first_name?: string;
  instructor_last_name?: string;
  witnesses?: string;
  is_guest?: boolean; // Gastflieger-Status
  // Separate Zeiten für Schüler (optional)
  student_flight_time?: string;
  student_end_time?: string;
  student_duration?: number;
  created_at: string;
  updated_at: string;
}

export interface FlugbuchStats {
  overall: {
    total_flights: number;
    total_minutes: number;
    different_models: number;
    first_flight: string;
    last_flight: string;
  };
  byType: Array<{
    model_type: string;
    flights_per_type: number;
    total_minutes: number;
  }>;
}

export interface CreateFlugbuchEntry {
  flightDate: string;
  flightTime?: string;
  duration: number;
  modelName: string;
  modelType?: string;
  modelWeight?: number;
  flightType: 'training' | 'fun' | 'competition' | 'test' | 'demonstration';
  location?: string;
  weatherConditions?: string;
  windSpeed?: string;
  temperature?: number;
  notes?: string;
  issues?: string;
  instructorId?: number;
  witnesses?: string;
}

// Eigene Einträge abrufen
export const getMyEntries = async (params?: {
  year?: number;
  month?: number;
  modelType?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get<{
    success: boolean;
    entries: FlugbuchEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>('/flugbuch/my-entries', { params });
  return response.data;
};

// Eintrag nach ID
export const getEntryById = async (id: number) => {
  const response = await apiClient.get<{ success: boolean; entry: FlugbuchEntry }>(
    `/flugbuch/${id}`
  );
  return response.data.entry;
};

// Neuen Eintrag erstellen
export const createEntry = async (data: CreateFlugbuchEntry) => {
  const response = await apiClient.post<{ success: boolean; message: string; entryId: number }>(
    '/flugbuch',
    data
  );
  return response.data;
};

// Eintrag aktualisieren
export const updateEntry = async (id: number, data: Partial<CreateFlugbuchEntry>) => {
  const response = await apiClient.put<{ success: boolean; message: string }>(
    `/flugbuch/${id}`,
    data
  );
  return response.data;
};

// Eintrag löschen
export const deleteEntry = async (id: number) => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `/flugbuch/${id}`
  );
  return response.data;
};

// Statistiken
export const getMyStats = async (year?: number) => {
  const response = await apiClient.get<{ success: boolean; stats: FlugbuchStats }>(
    '/flugbuch/my-stats',
    { params: { year } }
  );
  return response.data.stats;
};

// CSV Export
export const exportToCSV = async (year?: number) => {
  const response = await apiClient.get('/flugbuch/export-csv', {
    params: { year },
    responseType: 'blob',
  });
  
  // CSV-Datei downloaden
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `flugbuch_${year || 'gesamt'}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Alle Einträge (Admin/Vorstand)
export const getAllEntries = async (params?: {
  userId?: number;
  year?: number;
  month?: number;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get<{ success: boolean; entries: FlugbuchEntry[] }>(
    '/flugbuch/all',
    { params }
  );
  return response.data.entries;
};
