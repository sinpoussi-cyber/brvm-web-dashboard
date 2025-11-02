// src/lib/api.ts
// Client de données robuste: 1) API Render si dispo 2) fallback Supabase
import { supabase } from './supabase';

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const BASE = RAW_BASE.replace(/\/$/, ''); // retire le / final si présent

type Json = any;

// ---- Helpers HTTP ----------------------------------------------------------
async function getJson<T = Json>(path: string): Promise<T | null> {
  if (!BASE) return null;
  try {
    const r = await fetch(`${BASE}${path}`, { cache: 'no-store' });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

// ---- Sociétés --------------------------------------------------------------
export type CompanyLite = { symbol: string; name?: string; sector?: string };

export async function fetchCompanies(): Promise<CompanyLite[]> {
  // 1) Essai API
  const api = await getJson<{ companies: CompanyLite[] } | CompanyLite[]>('/api/v1/companies');
  if (api) {
    const arr = Array.isArray(api) ? api : api.companies;
    if (Array.isArray(arr) && arr.length) return arr.map((c: any) => ({
      symbol: c.symbol ?? c.ticker ?? c.code ?? c.company_symbol,
      name: c.name ?? c.company_name ?? c.fullname ?? undefined,
      sector: c.sector ?? c.industry ?? undefined,
    })).filter(c => c.symbol);
  }

  // 2) Supabase fallback
  // Tolérant: on sélectionne * et on normalise la clé du symbole
  const { data, error } = await supabase.from('companies').select('*').order('symbol', { ascending: true });
  if (error || !data) return [];
  return data.map((row: any) => ({
    symbol: row.symbol ?? row.ticker ?? row.code ?? row.company_symbol,
    name: row.name ?? row.company_name ?? row.fullname ?? undefined,
    sector: row.sector ?? row.industry ?? undefined,
  })).filter((x: any) => x.symbol);
}

// ---- Données marché globales utilisées ailleurs (déjà présentes côté Accueil) ----
export type Overview = { avg_change_percent: number; total_volume: number; total_companies: number };
export type TopMove = { symbol: string; latest_price: number; change_percent: number };

export async function fetchTopGainers(limit = 5): Promise<TopMove[]> {
  const api = await getJson<{ data: TopMove[] }>(`/api/v1/market/gainers/top?limit=${limit}`);
  if (api?.data) return api.data;
  return [];
}
export async function fetchTopLosers(limit = 5): Promise<TopMove[]> {
  const api = await getJson<{ data: TopMove[] }>(`/api/v1/market/losers/top?limit=${limit}`);
  if (api?.data) return api.data;
  return [];
}

// ---- Société : Historique + Prévisions + Dernier volume/valeur -------------
export type HistoryPoint = { date: string; price: number; volume?: number; traded_value?: number };
export type ForecastPoint = { date: string; price: number; lower?: number; upper?: number; confidence?: string };

export type CompanySeries = {
  history: HistoryPoint[];
  forecast: ForecastPoint[];
  last: { date?: string; price?: number; volume?: number; traded_value?: number } | null;
};

export async function fetchCompanySeries(symbol: string): Promise<CompanySeries> {
  // 1) API prédictions (si disponible)
  const api = await getJson<{
    history?: { date: string; price: number }[];
    forecast?: { prediction_date: string; predicted_price: number; lower_bound?: number; upper_bound?: number; confidence_level?: string }[];
  }>(`/api/v1/predictions/${encodeURIComponent(symbol)}`);

  let history: HistoryPoint[] = [];
  let forecast: ForecastPoint[] = [];

  if (api?.history?.length) {
    history = api.history.map(p => ({ date: p.date, price: Number(p.price) }));
  }
  if (api?.forecast?.length) {
    forecast = api.forecast.map(p => ({
      date: p.prediction_date,
      price: Number(p.predicted_price),
      lower: p.lower_bound != null ? Number(p.lower_bound) : undefined,
      upper: p.upper_bound != null ? Number(p.upper_bound) : undefined,
      confidence: p.confidence_level,
    }));
  }

  // 2) Compléter/Remplacer avec Supabase si besoin
  if (!history.length) {
    // historical_data: trade_date, close/price, volume, traded_value
    // Le nom de colonne du prix peut être "close", "price", "latest_price" suivant ton ETL
    const { data: h } = await supabase
      .from('historical_data')
      .select('*')
      .eq('symbol', symbol)
      .order('trade_date', { ascending: true })
      .limit(200);
    if (h?.length) {
      history = h.map((row: any) => ({
        date: row.trade_date,
        price: Number(row.close ?? row.price ?? row.latest_price ?? 0),
        volume: row.volume ?? row.total_volume ?? undefined,
        traded_value: row.traded_value ?? row.total_value ?? row.value ?? undefined,
      })).filter(x => x.price > 0);
    }
  }

  if (!forecast.length) {
    const { data: f } = await supabase
      .from('predictions')
      .select('*')
      .eq('symbol', symbol)
      .order('prediction_date', { ascending: true })
      .limit(40);
    if (f?.length) {
      forecast = f.map((row: any) => ({
        date: row.prediction_date,
        price: Number(row.predicted_price ?? row.price ?? 0),
        lower: row.lower_bound ?? row.lower ?? undefined,
        upper: row.upper_bound ?? row.upper ?? undefined,
        confidence: row.confidence_level ?? row.confidence ?? undefined,
      })).filter(x => x.price > 0);
    }
  }

  // Dernière séance (volume/valeur)
  const last = history.length ? history[history.length - 1] : null;
  return { history, forecast, last };
}

// ---- Résumé Technique -------------------------------------------------------
export type TechnicalSummary = {
  overall: 'Achat' | 'Vente' | 'Neutre' | 'Attendre' | 'Indisponible';
  details: Array<{ name: string; decision: string; value?: string }>;
};

export async function fetchTechnicalSummary(symbol: string): Promise<TechnicalSummary> {
  // 1) API
  const api = await getJson<{ overall: string; indicators: { name: string; decision: string; value?: string }[] }>(
    `/api/v1/analysis/${encodeURIComponent(symbol)}/signals`
  );
  if (api?.overall) {
    return {
      overall: (api.overall as any) ?? 'Indisponible',
      details: api.indicators ?? [],
    };
  }

  // 2) Supabase: table technical_analysis (prendre la ligne la + récente)
  const { data } = await supabase
    .from('technical_analysis')
    .select('*')
    .eq('symbol', symbol)
    .order('as_of_date', { ascending: false })
    .limit(1);
  if (data?.length) {
    const t = data[0];
    const details = [
      { name: 'Moyennes Mobiles', decision: t.ma_signal ?? t.mm_signal ?? 'N/A', value: `MM5:${t.mm5} / MM10:${t.mm10} / MM20:${t.mm20} / MM50:${t.mm50}` },
      { name: 'Bollinger', decision: t.bollinger_signal ?? 'N/A', value: `Band C:${t.bb_mid} / Sup:${t.bb_upper} / Inf:${t.bb_lower}` },
      { name: 'MACD', decision: t.macd_signal ?? 'N/A', value: `MACD:${t.macd} / Signal:${t.macd_signal_line} / Hist:${t.macd_hist}` },
      { name: 'RSI', decision: t.rsi_signal ?? 'N/A', value: `RSI:${t.rsi}` },
      { name: 'Stochastique', decision: t.stoch_signal ?? 'N/A', value: `%K:${t.stoch_k} / %D:${t.stoch_d}` },
    ];
    // Tiny agrégation simplifiée:
    const buy = details.filter(d => /achat/i.test(d.decision)).length;
    const sell = details.filter(d => /vente/i.test(d.decision)).length;
    const overall: TechnicalSummary['overall'] =
      buy > sell ? 'Achat' : sell > buy ? 'Vente' : 'Neutre';
    return { overall, details };
  }

  return { overall: 'Indisponible', details: [] };
}

// ---- Résumé Fondamental -----------------------------------------------------
export type FundamentalSummary = {
  summary: string;
  last_report?: { title?: string; date?: string; url?: string };
};

export async function fetchFundamentalSummary(symbol: string): Promise<FundamentalSummary> {
  // 1) API
  const api = await getJson<{ summary?: string; last_report?: { title?: string; date?: string; url?: string } }>(
    `/api/v1/fundamentals/company/${encodeURIComponent(symbol)}`
  );
  if (api) return { summary: api.summary ?? '—', last_report: api.last_report };

  // 2) Supabase
  const { data } = await supabase
    .from('fundamental_analysis')
    .select('*')
    .eq('symbol', symbol)
    .order('analyzed_at', { ascending: false })
    .limit(1);
  if (data?.length) {
    const f = data[0];
    return {
      summary: f.summary ?? f.synthesis ?? '—',
      last_report: { title: f.report_title, date: f.report_date, url: f.report_url },
    };
  }

  return { summary: 'Données fondamentales indisponibles pour le moment.' };
}
