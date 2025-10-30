/**
 * Articles Service
 * API für Presseartikel
 */

import apiClient from '../api-client';

export interface Article {
  id: number;
  author_id: number;
  author_first_name: string;
  author_last_name: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string;
  publish_date: string;
  featured_image?: string;
  is_featured: boolean;
  is_public: boolean;
  is_board_article: boolean;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published';
  approved_by?: number;
  approver_first_name?: string;
  approver_last_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleData {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string;
  publishDate?: string;
  featuredImage?: string;
  isPublic?: boolean;
  isBoardArticle?: boolean;
}

// Alle Artikel
export const getAllArticles = async (params?: {
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get<{ success: boolean; articles: Article[] }>('/articles', {
    params,
  });
  return response.data.articles;
};

// Artikel nach ID
export const getArticleById = async (id: number) => {
  const response = await apiClient.get<{ success: boolean; article: Article }>(`/articles/${id}`);
  return response.data.article;
};

// Eigene Artikel
export const getMyArticles = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get<{ success: boolean; articles: Article[] }>(
    '/articles/my/articles',
    { params }
  );
  return response.data.articles;
};

// Artikel erstellen
export const createArticle = async (data: CreateArticleData) => {
  const response = await apiClient.post<{ success: boolean; message: string; articleId: number }>(
    '/articles',
    data
  );
  return response.data;
};

// Artikel aktualisieren
export const updateArticle = async (id: number, data: Partial<CreateArticleData>) => {
  const response = await apiClient.put<{ success: boolean; message: string }>(
    `/articles/${id}`,
    data
  );
  return response.data;
};

// Artikel löschen
export const deleteArticle = async (id: number) => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `/articles/${id}`
  );
  return response.data;
};

// Artikel freigeben
export const approveArticle = async (id: number) => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/articles/${id}/approve`
  );
  return response.data;
};

// Artikel ablehnen
export const rejectArticle = async (id: number, reason?: string) => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/articles/${id}/reject`,
    { reason }
  );
  return response.data;
};

// Artikel veröffentlichen
export const publishArticle = async (id: number) => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/articles/${id}/publish`
  );
  return response.data;
};
