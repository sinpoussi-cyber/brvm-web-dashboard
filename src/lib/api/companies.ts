// ==============================================================================
// API COMPANIES - Gestion des sociétés cotées
// ==============================================================================

import apiClient, { handleApiError } from './client';
import { unwrapApiResponse } from './helpers';
import { getFallbackCompanies } from '../data/companiesFallback';
import type { CompanyDetail, Sector, ComparableCompaniesResponse } from '@/types/api';

const PUBLIC_API_BASES = Object.freeze([
  'https://www.brvm.org/api',
  'https://www.brvm.org/en/api',
  'https://www.brvm.org/fr/api',
]);

const PUBLIC_COMPANY_PATHS = Object.freeze([
  '/market/companies',
  '/companies',
  '/companies/list',
  '/markets/companies',
]);

const sanitizeString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  return undefined;
};

const sanitizeNumber = (value: unknown): number | undefined => {
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

const sanitizeDate = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return undefined;
};

const takeFirst = <T>(source: Record<string, unknown>, keys: string[]): T | undefined => {
  for (const key of keys) {
    if (key in source) {
      const candidate = source[key];
      if (candidate !== null && candidate !== undefined) {
        return candidate as T;
      }
    }
  }

  return undefined;
};

type RawCompany = Record<string, unknown>;

const normalizeCompany = (raw: unknown, fallbackId: number): CompanyDetail | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const payload = raw as RawCompany;

  const symbol =
    sanitizeString(
      takeFirst(payload, [
        'symbol',
        'ticker',
        'code',
        'company_code',
        'isin',
        'mnemonic',
      ]) ??
        (typeof payload.id === 'string' ? payload.id : undefined)
    ) ?? undefined;

  if (!symbol) {
    return null;
  }

  const name =
    sanitizeString(
      takeFirst(payload, [
        'name',
        'company',
        'title',
        'label',
        'company_name',
        'raison_sociale',
      ])
    ) ?? symbol;

  const sector =
    sanitizeString(
      takeFirst(payload, ['sector', 'industry', 'sector_name', 'activity', 'branche'])
    ) ?? null;

  const currentPrice =
    sanitizeNumber(
      takeFirst(payload, [
        'current_price',
        'last_price',
        'price',
        'close',
        'close_price',
        'prix',
        'value',
      ])
    ) ?? null;

  const priceChange =
    sanitizeNumber(
      takeFirst(payload, ['change', 'variation', 'price_change', 'difference', 'variation_value'])
    ) ?? null;

  const priceChangePercent =
    sanitizeNumber(
      takeFirst(payload, [
        'change_percent',
        'variation_percent',
        'performance',
        'percent_change',
        'price_change_percent',
      ])
    ) ?? null;

  const volume =
    sanitizeNumber(
      takeFirst(payload, [
        'volume',
        'trading_volume',
        'shares_traded',
        'quantity',
        'nbre_titres',
      ])
    ) ?? null;

  const marketCap =
    sanitizeNumber(
      takeFirst(payload, ['market_cap', 'capitalisation', 'marketcapitalisation', 'market_capitalization'])
    ) ?? null;

  const createdAt =
    sanitizeDate(
      takeFirst(payload, ['created_at', 'listing_date', 'date_intro', 'introduction_date'])
    ) ?? new Date().toISOString();

  const idCandidate = takeFirst<unknown>(payload, ['id', 'company_id', 'identifier']);
  const id = typeof idCandidate === 'number' ? idCandidate : fallbackId;

  return {
    id,
    symbol,
    name,
    sector,
    created_at: createdAt,
    current_price: currentPrice,
    price_change: priceChange,
    price_change_percent: priceChangePercent,
    volume,
    market_cap: marketCap,
  };
};

const unwrapCompanies = (payload: unknown): CompanyDetail[] => {
  if (!payload) {
    return [];
  }

  const tryArray = (value: unknown): unknown[] => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'object' && value !== null) {
      const container = value as Record<string, unknown>;
      const possibleKeys = ['results', 'data', 'items', 'companies', 'records'];

      for (const key of possibleKeys) {
        const nested = container[key];
        if (Array.isArray(nested)) {
          return nested;
        }
      }
    }

    return [];
  };

  const entries = tryArray(unwrapApiResponse<unknown>(payload));

  return entries
    .map((entry, index) => normalizeCompany(entry, index + 1))
    .filter((entry): entry is CompanyDetail => Boolean(entry));
};

const fetchPublicCompanies = async (
  params?: {
    sector?: string;
    search?: string;
  }
): Promise<CompanyDetail[] | null> => {
  const query = new URLSearchParams();

  if (params?.sector) {
    query.set('sector', params.sector);
  }

  if (params?.search) {
    query.set('search', params.search);
  }

  query.set('size', '500');

  for (const base of PUBLIC_API_BASES) {
    for (const path of PUBLIC_COMPANY_PATHS) {
      const url = `${base}${path}${query.toString() ? `?${query.toString()}` : ''}`;

      try {
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json, text/plain, */*',
            'User-Agent':
              'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const companies = unwrapCompanies(data);

        if (companies.length > 0) {
          return companies;
        }
      } catch (error) {
        console.warn('[companies] Fallback public fetch failed for', url, error);
      }
    }
  }

  return null;
};

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
    const fallback = await fetchPublicCompanies(params);

    if (fallback && fallback.length > 0) {
      return fallback;
    }

    const localFallback = getFallbackCompanies(params);

    if (localFallback.length > 0) {
      return localFallback;
    }

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
