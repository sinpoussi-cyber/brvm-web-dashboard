// ==============================================================================
// API USERS - Gestion utilisateurs et préférences
// ==============================================================================

import apiClient, { handleApiError } from './client';
import type { UserPreferences } from '@/types/api';

// Récupérer les préférences utilisateur
export const getPreferences = async (): Promise<UserPreferences> => {
  try {
    const response = await apiClient.get<UserPreferences>('/users/preferences');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Mettre à jour les préférences
export const updatePreferences = async (
  preferences: Partial<UserPreferences>
): Promise<UserPreferences> => {
  try {
    const response = await apiClient.put<UserPreferences>(
      '/users/preferences',
      preferences
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Réinitialiser les préférences
export const resetPreferences = async (): Promise<UserPreferences> => {
  try {
    const response = await apiClient.post<UserPreferences>(
      '/users/preferences/reset'
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
