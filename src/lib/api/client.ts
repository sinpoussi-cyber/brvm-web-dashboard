// ==============================================================================
// API CLIENT - Configuration Axios et gestion des erreurs
// ==============================================================================

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const DEFAULT_API_URL = 'https://brvm-api-xode.onrender.com';
const DEFAULT_API_VERSION = '/api/v1';
const PROXY_BASE_PATH = '/api/proxy';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

const sanitizeEnvValue = (value: string | undefined) => value?.trim().replace(/^['"]|['"]$/g, '');

const rawApiVersion = sanitizeEnvValue(process.env.NEXT_PUBLIC_API_VERSION) || DEFAULT_API_VERSION;
const normalizedApiVersion = ensureLeadingSlash(trimTrailingSlash(rawApiVersion));
const publicApiUrl = sanitizeEnvValue(process.env.NEXT_PUBLIC_API_URL);
const backendApiUrl = sanitizeEnvValue(process.env.BACKEND_API_URL) || publicApiUrl || DEFAULT_API_URL;
const apiAuthHeaderName = sanitizeEnvValue(process.env.API_AUTH_HEADER) || 'Authorization';
const apiAuthToken = sanitizeEnvValue(process.env.API_AUTH_TOKEN);

type BrowserRoutingDirective = 'true' | 'false' | 'auto';

const normalizeDirective = (value: string | undefined): BrowserRoutingDirective => {
  if (!value) {
    return 'auto';
  }

  const normalized = value.toLowerCase();

  if (normalized === 'true' || normalized === 'false') {
    return normalized;
  }

  return 'auto';
};

const rawDirective = sanitizeEnvValue(process.env.NEXT_PUBLIC_API_USE_DIRECT);
const directive = normalizeDirective(rawDirective);

const directBrowserBaseURL = publicApiUrl?.startsWith('http')
  ? `${trimTrailingSlash(publicApiUrl)}${normalizedApiVersion}`
  : null;

const canUseDirectBrowserCalls = Boolean(directBrowserBaseURL);

const prefersProxyByDefault =
  !canUseDirectBrowserCalls || (directive === 'auto' && process.env.NODE_ENV === 'development');

const browserUsesProxy =
  directive === 'false' || (!canUseDirectBrowserCalls && directive === 'true') ||
  (directive !== 'true' && prefersProxyByDefault);

const browserBaseURL = browserUsesProxy
  ? PROXY_BASE_PATH
  : directBrowserBaseURL ?? PROXY_BASE_PATH;

const browserFallbackBaseURL = browserUsesProxy ? directBrowserBaseURL : PROXY_BASE_PATH;

const serverBaseURL = `${trimTrailingSlash(backendApiUrl)}${normalizedApiVersion}`;

const browserRefreshUrl = browserUsesProxy
  ? `${PROXY_BASE_PATH}/auth/refresh`
  : `${directBrowserBaseURL}/auth/refresh`;
const serverRefreshUrl = `${serverBaseURL}/auth/refresh`;

const isBrowser = typeof window !== 'undefined';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _usedFallbackBase?: boolean;
};

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
const defaultHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};

if (!isBrowser && apiAuthToken) {
  defaultHeaders[apiAuthHeaderName] = apiAuthToken;
}

const apiClient = axios.create({
  baseURL: isBrowser ? browserBaseURL : serverBaseURL,
  timeout: 30000,
  headers: defaultHeaders,
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
    const originalRequest = error.config as RetriableRequestConfig;
    const isNetworkError = error.code === 'ERR_NETWORK' || (!error.response && error.request);

    if (
      isBrowser &&
      browserFallbackBaseURL &&
      isNetworkError &&
      !originalRequest._usedFallbackBase
    ) {
      console.warn(
        `[apiClient] Échec avec ${originalRequest.baseURL ?? apiClient.defaults.baseURL}. ` +
          `Nouvelle tentative avec ${browserFallbackBaseURL}.`
      );

      originalRequest._usedFallbackBase = true;
      originalRequest.baseURL = browserFallbackBaseURL;

      return apiClient(originalRequest);
    }
    
    // Si erreur 401 et pas déjà tenté de rafraîchir
    if (isBrowser && error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = safeStorage.get('refresh_token');

        if (refreshToken) {
          const refreshEndpoint = isBrowser ? browserRefreshUrl : serverRefreshUrl;
          const response = await axios.post(refreshEndpoint, {
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
