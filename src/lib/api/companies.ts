// ==============================================================================
// API COMPANIES - Gestion des sociétés cotées
// ==============================================================================

import apiClient, { handleApiError } from './client';

// Types définis localement pour éviter les problèmes de cache
interface Company {
  id: number;
  symbol: string;
  name: string;
  sector: string | null;
  created_at: string;
}

export interface CompanyDetail extends Company {
  current_price: number | null;
  price_change: number | null;
  price_change_percent: number | null;
  volume: number | null;
  market_cap: number | null;
}

export interface Sector {
  sector: string;
  company_count: number;
}

export interface ComparableCompany {
  symbol: string;
  name: string;
  sector: string;
  current_price: number;
  change_percent: number;
  volume?: number;
  mm_decision?: string;
  rsi_decision?: string;
  similarity_score: number;
}

export interface ComparableCompaniesResponse {
  symbol: string;
  sector: string;
  comparable_companies: ComparableCompany[];
}

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
