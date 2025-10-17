// ==============================================================================
// API COMPANIES - Gestion des sociétés cotées
// ==============================================================================

import apiClient, { handleApiError } from './client';
import type { CompanyDetail, Sector, ComparableCompaniesResponse } from '@/types/api';

// Récupérer toutes les sociétés
export const getCompanies = async (params?: {
  sector?: string;
  search?: string;
}): Promise<CompanyDetail[]> => {
  try {
    const response = await apiClient.get<CompanyDetail[]>('/companies/', { params });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Récupérer une société par symbole
export const getCompany = async (symbol: string): Promise<CompanyDetail> => {
  try {
    const response = await apiClient.get<CompanyDetail>(`/companies/${symbol}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Récupérer les secteurs
export const getSectors = async (): Promise<Sector[]> => {
  try {
    const response = await apiClient.get<Sector[]>('/companies/sectors/list');
    return response.data;
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
    const response = await apiClient.get<ComparableCompaniesResponse>(
      `/companies/${symbol}/comparable`,
      { params: { limit } }
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
