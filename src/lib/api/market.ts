// ==============================================================================
// API MARKET - Données de marché
// ==============================================================================

import apiClient, { handleApiError } from './client';
import { unwrapApiResponse } from './helpers';
import type { PriceData, Quote, TopCompany, SectorPerformanceResponse } from '@/types/api';

// Récupérer l'historique des prix
export const getPriceHistory = async (
  symbol: string,
  days = 100
): Promise<PriceData[]> => {
  try {
    const response = await apiClient.get(`/market/${symbol}/price`, {
      params: { days },
    });
    return unwrapApiResponse<PriceData[]>(response.data) ?? [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Récupérer la cotation actuelle
export const getQuote = async (symbol: string): Promise<Quote> => {
  try {
    const response = await apiClient.get(`/market/${symbol}/quote`);
    const quote = unwrapApiResponse<Quote>(response.data);

    if (!quote) {
      throw new Error('Réponse invalide reçue pour la cotation.');
    }

    return quote;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Top gainers
export const getTopGainers = async (limit = 10): Promise<TopCompany[]> => {
  try {
    const response = await apiClient.get('/market/gainers/top', {
      params: { limit },
    });
    return unwrapApiResponse<TopCompany[]>(response.data) ?? [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Top losers
export const getTopLosers = async (limit = 10): Promise<TopCompany[]> => {
  try {
    const response = await apiClient.get('/market/losers/top', {
      params: { limit },
    });
    return unwrapApiResponse<TopCompany[]>(response.data) ?? [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Top volumes
export const getTopVolume = async (limit = 10): Promise<TopCompany[]> => {
  try {
    const response = await apiClient.get('/market/volume/top', {
      params: { limit },
    });
    return unwrapApiResponse<TopCompany[]>(response.data) ?? [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Performance par secteur
export const getSectorPerformance = async (
  period = 30
): Promise<SectorPerformanceResponse> => {
  try {
    const response = await apiClient.get('/market/sectors/performance', {
      params: { period },
    });
    const data = unwrapApiResponse<SectorPerformanceResponse>(response.data);

    if (!data) {
      throw new Error('Réponse invalide reçue pour la performance sectorielle.');
    }

    return data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
