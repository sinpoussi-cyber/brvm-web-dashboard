// ==============================================================================
// API MARKET - Données de marché
// ==============================================================================

import axios from 'axios';

import apiClient, { handleApiError } from './client';
import { unwrapApiResponse } from './helpers';
import type { PriceData, Quote, TopCompany, SectorPerformanceResponse } from '@/types/api';

type RawTopCompany = Record<string, unknown>;

const topListParamAliases = (limit: number) => ({
  limit,
  size: limit,
  page_size: limit,
  per_page: limit,
  top: limit,
});

const coerceNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const sanitized = value
      .replace(/\s+/g, '')
      .replace(/,(\d{1,2})$/, '.$1')
      .replace(/[^0-9.+-]/g, '');

    if (sanitized.length > 0) {
      const parsed = Number(sanitized);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
};

const coerceString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  return undefined;
};

const getFirstDefined = (source: RawTopCompany, keys: string[]): unknown => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
};

const normalizeTopCompany = (raw: unknown): TopCompany | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const payload = raw as RawTopCompany;

  const symbol = coerceString(
    getFirstDefined(payload, ['symbol', 'ticker', 'code', 'isin', 'company_code'])
  );

  if (!symbol) {
    return null;
  }

  const name =
    coerceString(
      getFirstDefined(payload, ['name', 'company', 'company_name', 'label', 'title'])
    ) ?? symbol;

  const currentPrice =
    coerceNumber(
      getFirstDefined(payload, [
        'current_price',
        'price',
        'last_price',
        'close',
        'close_price',
        'value',
      ])
    ) ?? 0;

  const change =
    coerceNumber(
      getFirstDefined(payload, [
        'change',
        'price_change',
        'variation',
        'variation_value',
        'change_value',
      ])
    ) ?? 0;

  const changePercent =
    coerceNumber(
      getFirstDefined(payload, [
        'change_percent',
        'variation_percent',
        'percent_change',
        'performance',
        'change_percentage',
      ])
    ) ?? (currentPrice !== 0 ? (change / Math.max(currentPrice - change, 1e-9)) * 100 : 0);

  const volume = coerceNumber(
    getFirstDefined(payload, [
      'volume',
      'trading_volume',
      'total_volume',
      'volume_total',
      'quantity',
      'shares_traded',
    ])
  );

  return {
    symbol,
    name,
    current_price: currentPrice,
    change,
    change_percent: changePercent,
    volume: volume ?? undefined,
  };
};

const unwrapTopCompanies = (payload: unknown): TopCompany[] => {
  let unwrapped = unwrapApiResponse<unknown>(payload);

  if (typeof unwrapped === 'string') {
    try {
      unwrapped = JSON.parse(unwrapped) as unknown;
    } catch (error) {
      console.warn('[market] Impossible d\'analyser la réponse JSON des tops', error);
      unwrapped = [];
    }
  }

  const tryArray = (value: unknown): unknown[] => {
    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === 'object') {
      const container = value as RawTopCompany;
      const possibleKeys = [
        'gainers',
        'losers',
        'companies',
        'results',
        'items',
        'data',
        'top',
        'records',
      ];

      for (const key of possibleKeys) {
        const nested = container[key];
        if (Array.isArray(nested)) {
          return nested;
        }
      }
    }

    return [];
  };

  const entries = tryArray(unwrapped);

  return entries
    .map((entry) => normalizeTopCompany(entry))
    .filter((entry): entry is TopCompany => Boolean(entry));
};

const shouldRetryTopEndpoint = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;

  if (!status) {
    return false;
  }

  return [404, 405, 422].includes(status);
};

const fetchTopCompanies = async (
  endpoints: string | string[],
  limit = 10
): Promise<TopCompany[]> => {
  const candidates = Array.isArray(endpoints) ? endpoints : [endpoints];
  let lastError: unknown = new Error('Aucun endpoint disponible');

  for (const endpoint of candidates) {
    try {
      const response = await apiClient.get(endpoint, {
        params: topListParamAliases(limit),
      });

      const companies = unwrapTopCompanies(response.data);

      return companies.slice(0, limit);
    } catch (error) {
      lastError = error;

      if (!shouldRetryTopEndpoint(error)) {
        break;
      }
    }
  }
  
  throw new Error(handleApiError(lastError));
};

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
  return fetchTopCompanies(
    ['/market/gainers/top', '/market/top/gainers', '/market/top-gainers', '/market/gainers'],
    limit
  );
};

// Top losers
export const getTopLosers = async (limit = 10): Promise<TopCompany[]> => {
  return fetchTopCompanies(
    ['/market/losers/top', '/market/top/losers', '/market/top-losers', '/market/losers'],
    limit
  );
};

// Top volumes
export const getTopVolume = async (limit = 10): Promise<TopCompany[]> => {
  return fetchTopCompanies(
    ['/market/volume/top', '/market/top/volume', '/market/top-volume', '/market/volume'],
    limit
  );
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
