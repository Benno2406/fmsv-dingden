/**
 * API Client
 * Axios-basierter HTTP-Client mit automatischer Token-Verwaltung
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Backend URL aus Umgebungsvariable oder Default
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3000/api';

// Token Storage Keys
const ACCESS_TOKEN_KEY = 'fmsv_access_token';
const REFRESH_TOKEN_KEY = 'fmsv_refresh_token';

// Axios Instance erstellen
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Access Token automatisch anhängen
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Automatisches Token-Refresh bei 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Wenn 401 und noch kein Retry-Versuch
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Warte auf Token-Refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        // Kein Refresh Token -> Logout
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Token erneuern
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper Functions
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const isAuthenticated = () => {
  return !!getAccessToken();
};

// Error Handler Helper
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Network Error - Backend nicht erreichbar
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return 'Backend nicht erreichbar. Verwende für Offline-Tests eine E-Mail mit "dev@" (z.B. dev@admin).';
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.status === 401) {
      return 'Falsche E-Mail oder Passwort.';
    }
    if (error.response?.status === 403) {
      return 'Keine Berechtigung für diese Aktion.';
    }
    if (error.response?.status === 404) {
      return 'Ressource nicht gefunden.';
    }
    if (error.response?.status >= 500) {
      return 'Serverfehler. Bitte versuche es später erneut.';
    }
    if (error.request) {
      return 'Backend nicht erreichbar. Verwende für Offline-Tests eine E-Mail mit "dev@" (z.B. dev@admin).';
    }
  }
  return 'Ein unbekannter Fehler ist aufgetreten.';
};

export default apiClient;
