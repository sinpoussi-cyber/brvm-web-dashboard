// src/lib/api.ts

import { fetchIndexLast20d, fetchIndexMonthlyAvg10m } from './supabase';

// Re-export the richer server-side helpers that live in /lib.
// Those functions include Supabase fallbacks and are primarily used by the
// new `app/` router pages.
export {
  fetchOverview,
  fetchTopGainers,
  fetchTopLosers,
  fetchComposite20d,
  fetchMeta,
  fetchIndices10m,
  fetchIndicesVariations,
  fetchMarketMetrics10m,
} from '../../lib/api';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || '';

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'Accept': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${url} -> ${res.status} ${res.statusText} ${text}`);
  }
  return res.json() as Promise<T>;
}

/** Market overview */
export async function fetchMarketOverview() {
  return jsonFetch<{
    last_update?: string;
    indices?: {
      brvm_composite?: number;
      brvm_30?: number;
      brvm_prestige?: number;
      brvm_croissance?: number;
    };
    capitalisation_globale?: number;
    volume_moyen_annuel?: number;
    valeur_moyenne_annuelle?: number;
    total_companies?: number;
  }>('/api/v1/market/overview');
}


/** Fundamentals (global + by symbol) — adapter à ton API si besoin */
export async function fetchFundamentalsSummary() {
  // Exemple d’endpoint: /api/v1/fundamentals/summary
  // Si non dispo, renvoie un tableau vide.
  try {
    return await jsonFetch<any>('/api/v1/fundamentals/summary');
  } catch {
    return { sectors: [], highlights: [] };
  }
}
export async function fetchCompanyFundamentals(symbol: string) {
  try {
    return await jsonFetch<any>(`/api/v1/fundamentals/company/${encodeURIComponent(symbol)}`);
  } catch {
    return null;
  }
}

/** Predictions */
export async function fetchPredictions(symbol: string) {
  try {
    return await jsonFetch<{ history: { date: string; price: number }[]; forecast: { date: string; price: number }[] }>(
      `/api/v1/predictions/${encodeURIComponent(symbol)}`
    );
  } catch {
    return { history: [], forecast: [] };
  }
}

/** Listings & quotes (pour la page sociétés / portefeuille) */
export async function fetchListings() {
  try {
    return await jsonFetch<{ symbols: string[] }>(`/api/v1/market/listings`);
  } catch {
    return { symbols: [] };
  }
}
export async function fetchQuote(symbol: string) {
  try {
    return await jsonFetch<{ symbol: string; price: number; change_percent: number }>(
      `/api/v1/market/quote/${encodeURIComponent(symbol)}`
    );
  } catch {
    return { symbol, price: 0, change_percent: 0 };
  }
}

/** Signals (buy/sell picks) */
export async function fetchSignals() {
  try {
    return await jsonFetch<{ buys: { symbol: string; score: number }[]; sells: { symbol: string; score: number }[] }>(
      `/api/v1/signals/recap`
    );
  } catch {
    return { buys: [], sells: [] };
  }
}

type IndexKey = 'composite' | 'brvm30' | 'prestige' | 'croissance';
const INDEX_CODES: Record<IndexKey, 'composite' | 'brvm_30' | 'prestige' | 'croissance'> = {
  composite: 'composite',
  brvm30: 'brvm_30',
  prestige: 'prestige',
  croissance: 'croissance',
};

export async function getIndexSeries20d(key: IndexKey) {
  const rows = await fetchIndexLast20d(INDEX_CODES[key]);
  return rows.map((r) => ({ d: r.date, v: Number(r.value) }));
}

export async function getIndexSeries10m(key: IndexKey) {
  const rows = await fetchIndexMonthlyAvg10m(INDEX_CODES[key]);
  return rows.map((r) => ({ mois: r.month, moyenne: Number(r.avg_value) }));
}

export { BASE as API_BASE_URL };
