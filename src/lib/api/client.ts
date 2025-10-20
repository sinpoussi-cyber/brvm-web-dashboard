// ==============================================================================
// API CLIENT - Configuration Axios et gestion des erreurs
// ==============================================================================

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://brvm-api-xode.onrender.com';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || '/api/v1';

const isBrowser = typeof window !== 'undefined';

const safeStorage = {
  get(key: string) {
    if (!isBrowser) {
      return null;
    }

    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn(`[apiClient] Impossible de lire ${key} depuis localStorage`, error);
      return null;
    }
  },
  set(key: string, value: string) {
    if (!isBrowser) {
      return;
    }

    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`[apiClient] Impossible d'écrire ${key} dans localStorage`, error);
    }
  },
  remove(key: string) {
    if (!isBrowser) {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[apiClient] Impossible de supprimer ${key} de localStorage`, error);
    }
  },
};

// Créer l'instance Axios
const apiClient = axios.create({
  baseURL: `${API_URL}${API_VERSION}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requêtes (ajouter le token)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = safeStorage.get('access_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponses (gérer les erreurs)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si erreur 401 et pas déjà tenté de rafraîchir
    if (isBrowser && error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = safeStorage.get('refresh_token');

        if (refreshToken) {
          const response = await axios.post(`${API_URL}${API_VERSION}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data as {
            access_token: string;
            refresh_token: string;
          };

          safeStorage.set('access_token', access_token);
          safeStorage.set('refresh_token', newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Échec du rafraîchissement, déconnecter l'utilisateur côté client uniquement
        safeStorage.remove('access_token');
        safeStorage.remove('refresh_token');

        if (isBrowser) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Fonction helper pour gérer les erreurs API
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Erreur retournée par le serveur
      const message = error.response.data?.detail || error.response.data?.message;
      return message || `Erreur ${error.response.status}`;
    } else if (error.request) {
      // Pas de réponse du serveur
      return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    }
  }
  
  return 'Une erreur inattendue est survenue';
}

export default apiClient;
