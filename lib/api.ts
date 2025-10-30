import { supabase } from './supabase';
import type { Overview, TopMove, IndexPoint } from '@/types/market';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';

async function get<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${BASE}${path}`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return await r.json() as T;
  } catch { return null; }
}

export async function fetchOverview(): Promise<Overview> {
  // 1) Essaye l’API Render
  const api = await get<{ overview: Overview }>('/api/v1/market/overview');
  if (api?.overview) return api.overview;

  // 2) Fallback Supabase (total_companies & last volume approximé)
  const [{ data: companiesCnt }, { data: volAgg }] = await Promise.all([
    supabase.from('companies').select('id', { count: 'exact', head: true }),
    supabase.from('historical_data')
      .select('value: value', { head: false })
      .order('trade_date', { ascending: false }).limit(5000),
  ]);
  const totalVolume = (volAgg ?? []).reduce((s: any, r: any) => s + (r?.value ? 1 : 0), 0); // approxim.
  return {
    avg_change_percent: 0,
    total_volume: totalVolume,
    total_companies: companiesCnt?.length ? companiesCnt.length : (companiesCnt as any)?.count ?? 0,
  };
}

export async function fetchTopGainers(): Promise<TopMove[]> {
  const data = await get<{ data: TopMove[] }>('/api/v1/market/gainers/top');
  return data?.data ?? [];
}
export async function fetchTopLosers(): Promise<TopMove[]> {
  const data = await get<{ data: TopMove[] }>('/api/v1/market/losers/top');
  return data?.data ?? [];
}

/** Indice Composite: 20 derniers jours (API si dispo, sinon moyenne simple Supabase) */
export async function fetchComposite20d(): Promise<IndexPoint[]> {
  // Si demain tu exposes /api/v1/indices/composite/history?days=20, ça marchera
  const api = await get<{ data: IndexPoint[] }>('/api/v1/indices/composite/history?days=20');
  if (api?.data) return api.data;

  // Fallback Supabase: somme des prix journaliers d’un panier (approximation robuste)
  const { data, error } = await supabase.rpc('composite_last_20d'); // si tu crées une RPC
  if (!error && Array.isArray(data)) return data as IndexPoint[];

  // Fallback minimaliste: moyenne des prix par jour (sur une société “référence”)
  const { data: d2 } = await supabase
    .from('historical_data')
    .select('trade_date, price')
    .order('trade_date', { ascending: false })
    .limit(20);
  return (d2 ?? [])
    .reverse()
    .map((r: any, i: number) => ({ date: r.trade_date, value: Number(r.price) || (i ? i : 1) }));
}

/** Métadonnées (dernière date & nb sociétés) */
export async function fetchMeta() {
  const [maxDateQ, companiesCntQ] = await Promise.all([
    supabase.from('historical_data').select('trade_date').order('trade_date', { ascending: false }).limit(1),
    supabase.from('companies').select('id', { count: 'exact', head: true }),
  ]);
  const lastDate = maxDateQ.data?.[0]?.trade_date ?? null;
  const companies = (companiesCntQ as any)?.count ?? companiesCntQ.data?.length ?? 0;
  return { lastDate, companies };
}
/** Indices 10 derniers mois (tous à la fois via Supabase RPC) */
export async function fetchIndices10m() {
  const { data, error } = await supabase.rpc('indices_last_10m');
  if (error) {
    console.error('Erreur RPC indices_last_10m', error.message);
    return [];
  }
  return data || [];
}
