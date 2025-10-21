import apiClient, { handleApiError } from './client';
import { unwrapApiResponse } from './helpers';

interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const isBrowser = typeof window !== 'undefined';

const persistToken = (key: string, value?: string) => {
  if (!isBrowser) {
    return;
  }
  
  try {
        if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn(`[auth] Impossible de gérer ${key} dans localStorage`, error);
    }
};

export const loginUser = async (email: string, password: string): Promise<AuthTokens> => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    const tokens = unwrapApiResponse<AuthTokens | null>(response.data);

    if (!tokens || !tokens.access_token) {
      throw new Error("Réponse de connexion invalide renvoyée par l'API.");
    }

    persistToken(ACCESS_TOKEN_KEY, tokens.access_token);

    if (tokens.refresh_token) {
      persistToken(REFRESH_TOKEN_KEY, tokens.refresh_token);
    }

    return tokens;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const registerUser = async (email: string, password: string): Promise<void> => {
  try {
    await apiClient.post('/auth/register', { email, password });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
