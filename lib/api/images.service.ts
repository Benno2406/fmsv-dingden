/**
 * Images & Albums Service
 * API für Bildverwaltung
 */

import apiClient from '../api-client';

export interface Album {
  id: number;
  created_by: number;
  creator_first_name: string;
  creator_last_name: string;
  title: string;
  description?: string;
  album_date?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published';
  approved_by?: number;
  approved_at?: string;
  is_public: boolean;
  cover_image?: string;
  view_count: number;
  image_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Image {
  id: number;
  album_id?: number;
  uploaded_by: number;
  uploader_first_name: string;
  uploader_last_name: string;
  filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  title?: string;
  description?: string;
  alt_text?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  sort_order: number;
  is_slider_image?: boolean;
  created_at: string;
}

// Alle Alben
export const getAllAlbums = async (params?: { status?: string; page?: number; limit?: number }) => {
  const response = await apiClient.get<{ success: boolean; albums: Album[] }>('/images/albums', {
    params,
  });
  return response.data.albums;
};

// Album nach ID (mit Bildern)
export const getAlbumById = async (id: number) => {
  const response = await apiClient.get<{ success: boolean; album: Album & { images: Image[] } }>(
    `/images/albums/${id}`
  );
  return response.data.album;
};

// Album erstellen
export const createAlbum = async (data: { title: string; description?: string; albumDate?: string; isPublic?: boolean }) => {
  const response = await apiClient.post<{ success: boolean; message: string; albumId: number }>(
    '/images/albums',
    data
  );
  return response.data;
};

// Album aktualisieren
export const updateAlbum = async (id: number, data: Partial<{ title: string; description: string; albumDate: string; isPublic: boolean; coverImage: string }>) => {
  const response = await apiClient.put<{ success: boolean; message: string }>(
    `/images/albums/${id}`,
    data
  );
  return response.data;
};

// Album zur Freigabe einreichen
export const submitAlbumForApproval = async (id: number) => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/images/albums/${id}/submit`
  );
  return response.data;
};

// Album freigeben
export const approveAlbum = async (id: number) => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/images/albums/${id}/approve`
  );
  return response.data;
};

// Album veröffentlichen
export const publishAlbum = async (id: number) => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/images/albums/${id}/publish`
  );
  return response.data;
};

// Album löschen
export const deleteAlbum = async (id: number) => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `/images/albums/${id}`
  );
  return response.data;
};

// Bilder hochladen
export const uploadImages = async (files: File[], albumId?: number, title?: string, description?: string) => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('images', file);
  });
  
  if (albumId) formData.append('albumId', albumId.toString());
  if (title) formData.append('title', title);
  if (description) formData.append('description', description);

  const response = await apiClient.post<{
    success: boolean;
    message: string;
    images: Array<{ id: number; filename: string; path: string }>;
  }>('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Alle Bilder (Verwaltung)
export const getAllImages = async (params?: { status?: string; albumId?: number; page?: number; limit?: number }) => {
  const response = await apiClient.get<{ success: boolean; images: Image[] }>('/images', {
    params,
  });
  return response.data.images;
};

// Bild freigeben
export const approveImage = async (id: number) => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/images/${id}/approve`
  );
  return response.data;
};

// Bild ablehnen
export const rejectImage = async (id: number, reason?: string) => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/images/${id}/reject`,
    { reason }
  );
  return response.data;
};

// Bild aktualisieren
export const updateImage = async (id: number, data: Partial<{ title: string; description: string; altText: string; isSliderImage: boolean }>) => {
  const response = await apiClient.put<{ success: boolean; message: string }>(`/images/${id}`, data);
  return response.data;
};

// Bild löschen
export const deleteImage = async (id: number) => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/images/${id}`);
  return response.data;
};
