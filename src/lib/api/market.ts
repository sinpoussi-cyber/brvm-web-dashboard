// ==============================================================================
// API MARKET - Données de marché
// ==============================================================================

import apiClient, { handleApiError } from './client';
import type {
  PriceData,
  Quote,
  TopCompany,
  SectorPerformanceResponse,
} from '@/types/api';

// Récupérer l'historique des prix
export const getPriceHistory = async (
  symbol: string,
  days = 100
): Promise<PriceData[]> => {
  try {
    const response = await apiClient.get<PriceData[]>(`/market/${symbol}/price`, {
      params: { days },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Récupérer la cotation actuelle
export const getQuote = async (symbol: string): Promise<Quote> => {
  try {
    const response = await apiClient.get<Quote>(`/market/${symbol}/quote`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Top gainers
export const getTopGainers = async (limit = 10): Promise<TopCompany[]> => {
  try {
    const response = await apiClient.get<TopCompany[]>('/market/gainers/top', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Top losers
export const getTopLosers = async (limit = 10): Promise<TopCompany[]> => {
  try {
    const response = await apiClient.get<TopCompany[]>('/market/losers/top', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Top volumes
export const getTopVolume = async (limit = 10): Promise<TopCompany[]> => {
  try {
    const response = await apiClient.get<TopCompany[]>('/market/volume/top', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Performance par secteur
export const getSectorPerformance = async (
  period = 30
): Promise<SectorPerformanceResponse> => {
  try {
    const response = await apiClient.get<SectorPerformanceResponse>(
      '/market/sectors/performance',
      { params: { period } }
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
