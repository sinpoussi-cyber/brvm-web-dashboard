// ==============================================================================
// API COMPANIES - Gestion des sociétés cotées
// ==============================================================================

import apiClient, { handleApiError } from './client';
import { unwrapApiResponse } from './helpers';
import type { CompanyDetail, Sector, ComparableCompaniesResponse } from '@/types/api';

// Re-export types for convenience
export type { 
  CompanyDetail, 
  Sector, 
  ComparableCompany,
  ComparableCompaniesResponse 
} from '@/types/api';

// Récupérer toutes les sociétés
export const getCompanies = async (params?: {
  sector?: string;
  search?: string;
}): Promise<CompanyDetail[]> => {
  try {
    const response = await apiClient.get('/companies/', { params });
    return unwrapApiResponse<CompanyDetail[]>(response.data) ?? [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Récupérer une société par symbole
export const getCompany = async (symbol: string): Promise<CompanyDetail> => {
  try {
    const response = await apiClient.get(`/companies/${symbol}`);
    const company = unwrapApiResponse<CompanyDetail>(response.data);

    if (!company) {
      throw new Error('Réponse invalide reçue pour la société demandée.');
    }

    return company;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Récupérer les secteurs
export const getSectors = async (): Promise<Sector[]> => {
  try {
    const response = await apiClient.get('/companies/sectors/list');
    return unwrapApiResponse<Sector[]>(response.data) ?? [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Récupérer les sociétés comparables
export const getComparableCompanies = async (
  symbol: string,
  limit = 5
): Promise<ComparableCompaniesResponse> => {
  try {
    const response = await apiClient.get(`/companies/${symbol}/comparable`, {
      params: { limit },
    });
    const data = unwrapApiResponse<ComparableCompaniesResponse>(response.data);

    if (!data) {
      throw new Error('Réponse invalide reçue pour les sociétés comparables.');
    }

    return data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
