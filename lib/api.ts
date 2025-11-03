'use server';

import { supabase } from '@/lib/supabaseClient';

type Json = any;

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const API_BASE = RAW_BASE.replace(/\/$/, '');

async function getJson<T = Json>(path: string): Promise<T | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (error) {
    console.warn('API fetch failed', path, error);
    return null;
  }
}

function pickNumber(row: Record<string, any>, keys: readonly string[]): number | undefined {
  for (const key of keys) {
    if (!key) continue;
    const value = row?.[key];
    if (value === null || value === undefined) continue;
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return undefined;
}

function pickDate(row: Record<string, any>, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = row?.[key];
    if (value) return String(value);
  }
  return undefined;
}

const INDEX_CONFIGS = [
  {
    code: 'brvm_composite',
    name: 'BRVM Composite',
    valueKeys: ['brvm_composite', 'brvm_composite_index', 'indice_brvm_composite', 'brvm_composite_value'],
    dailyKeys: [
      'brvm_composite_variation',
      'brvm_composite_variation_percent',
      'brvm_composite_change_percent',
      'brvm_composite_var_jour',
      'variation_journaliere_brvm_composite',
    ],
    ytdKeys: [
      'brvm_composite_ytd',
      'variation_ytd_brvm_composite',
      'brvm_composite_variation_ytd',
      'ytd_brvm_composite',
    ],
  },
  {
    code: 'brvm_30',
    name: 'BRVM 30',
    valueKeys: ['brvm_30', 'brvm30', 'indice_brvm_30', 'brvm_30_index'],
    dailyKeys: [
      'brvm_30_variation',
      'brvm_30_variation_percent',
      'brvm_30_change_percent',
      'variation_journaliere_brvm_30',
    ],
    ytdKeys: [
      'brvm_30_ytd',
      'variation_ytd_brvm_30',
      'brvm_30_variation_ytd',
    ],
  },
  {
    code: 'brvm_prestige',
    name: 'BRVM Prestige',
    valueKeys: ['brvm_prestige', 'indice_brvm_prestige', 'brvm_prestige_index'],
    dailyKeys: [
      'brvm_prestige_variation',
      'brvm_prestige_variation_percent',
      'variation_journaliere_brvm_prestige',
    ],
    ytdKeys: [
      'brvm_prestige_ytd',
      'variation_ytd_brvm_prestige',
      'brvm_prestige_variation_ytd',
    ],
  },
  {
    code: 'brvm_principal',
    name: 'BRVM Principal',
    valueKeys: ['brvm_principal', 'indice_brvm_principal', 'brvm_principal_index', 'principal_index'],
    dailyKeys: [
      'brvm_principal_variation',
      'brvm_principal_variation_percent',
      'variation_journaliere_brvm_principal',
    ],
    ytdKeys: [
      'brvm_principal_ytd',
      'variation_ytd_brvm_principal',
      'brvm_principal_variation_ytd',
    ],
  },
] as const;

const DATE_KEYS = ['extraction_date', 'trade_date', 'date', 'as_of_date', 'created_at'];

export type IndexHistoryPoint = {
  date: string;
  value: number;
  variation_daily?: number;
  variation_ytd?: number;
};

export type IndexOverview = {
  code: string;
  name: string;
  value: number;
  variation_daily: number;
  variation_ytd: number;
  history: IndexHistoryPoint[];
};

function parseApiIndices(payload: any): Partial<IndexOverview>[] | null {
  if (!payload) return null;
  const arr = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.indices)
    ? payload.indices
    : Array.isArray(payload?.data)
    ? payload.data
    : null;
  if (!arr) return null;
  return arr
    .map((item: any) => {
      const rawCode = String(item.code ?? item.symbol ?? item.name ?? '').toLowerCase();
      const config = INDEX_CONFIGS.find((cfg) => rawCode.includes(cfg.code.replace('brvm_', '').replace('_', '')) || rawCode.includes(cfg.code));
      if (!config) return null;
      const value = pickNumber(item, ['value', 'index', 'price', 'latest_value']);
      const daily = pickNumber(item, ['change_percent', 'variation_daily', 'daily_change']);
      const ytd = pickNumber(item, ['ytd_change', 'variation_ytd', 'performance_ytd']);
      return {
        code: config.code,
        name: config.name,
        value: value ?? 0,
        variation_daily: daily ?? 0,
        variation_ytd: ytd ?? 0,
        history: Array.isArray(item.history)
          ? (item.history as any[]).map((row) => ({
              date: String(row.date ?? row.day ?? row.trade_date ?? ''),
              value: Number(row.value ?? row.index ?? 0),
              variation_daily: pickNumber(row, ['variation_daily', 'change_percent', 'daily_change']),
              variation_ytd: pickNumber(row, ['variation_ytd', 'ytd_change']),
            }))
          : [],
      } satisfies Partial<IndexOverview>;
    })
    .filter(Boolean) as Partial<IndexOverview>[];
}

function mergeIndexData(
  base: IndexOverview[],
  updates: Partial<IndexOverview>[] | null
): IndexOverview[] {
  if (!updates?.length) return base;
  const map = new Map(base.map((item) => [item.code, { ...item }]));
  for (const update of updates) {
    if (!update?.code) continue;
    const existing = map.get(update.code);
    if (existing) {
      map.set(update.code, {
        ...existing,
        ...update,
        history: update.history && update.history.length ? update.history : existing.history,
      });
    } else {
      map.set(update.code, {
        code: update.code,
        name: update.name ?? update.code,
        value: update.value ?? 0,
        variation_daily: update.variation_daily ?? 0,
        variation_ytd: update.variation_ytd ?? 0,
        history: update.history ?? [],
      });
    }
  }
  return Array.from(map.values());
}

export async function fetchIndicesOverview(): Promise<IndexOverview[]> {
  const apiPayload =
    (await getJson('/api/v1/market/indices/overview')) ??
    (await getJson('/api/v1/market/indices')) ??
    (await getJson('/api/v1/indices'));
  const apiIndices = parseApiIndices(apiPayload);

  const { data: supaData } = await supabase
    .from('new_market_indicators')
    .select('*')
    .order('extraction_date', { ascending: false })
    .limit(60);

  if (!supaData?.length) {
    return mergeIndexData(
      INDEX_CONFIGS.map((cfg) => ({
        code: cfg.code,
        name: cfg.name,
        value: 0,
        variation_daily: 0,
        variation_ytd: 0,
        history: [],
      })),
      apiIndices
    );
  }

  const historyMap = new Map<string, IndexHistoryPoint[]>();
  const sorted = [...supaData].sort((a, b) => {
    const da = Date.parse(pickDate(a, DATE_KEYS) ?? '');
    const db = Date.parse(pickDate(b, DATE_KEYS) ?? '');
    if (!Number.isNaN(da) && !Number.isNaN(db)) return da - db;
    return 0;
  });

  for (const row of sorted) {
    const date = pickDate(row, DATE_KEYS);
    if (!date) continue;
    for (const cfg of INDEX_CONFIGS) {
      const value = pickNumber(row, cfg.valueKeys);
      if (value === undefined) continue;
      const point: IndexHistoryPoint = {
        date,
        value,
        variation_daily: pickNumber(row, cfg.dailyKeys),
        variation_ytd: pickNumber(row, cfg.ytdKeys),
      };
      const arr = historyMap.get(cfg.code) ?? [];
      arr.push(point);
      historyMap.set(cfg.code, arr);
    }
  }

  const latest = supaData[0];
  const base = INDEX_CONFIGS.map((cfg) => ({
    code: cfg.code,
    name: cfg.name,
    value: pickNumber(latest, cfg.valueKeys) ?? 0,
    variation_daily: pickNumber(latest, cfg.dailyKeys) ?? 0,
    variation_ytd: pickNumber(latest, cfg.ytdKeys) ?? 0,
    history: historyMap.get(cfg.code) ?? [],
  }));

  return mergeIndexData(base, apiIndices);
}

export type MarketHistoryPoint = {
  date: string;
  capitalisation_globale?: number;
  variation_j_cap?: number;
  volume_moyen_annuel?: number;
  variation_j_vol?: number;
  valeur_moyenne_annuelle?: number;
  variation_j_val?: number;
};

export type MarketStats = {
  date: string;
  total_companies: number;
  capitalisation_globale: number;
  variation_j_cap: number;
  volume_moyen_annuel: number;
  variation_j_vol: number;
  valeur_moyenne_annuelle: number;
  variation_j_val: number;
  history: MarketHistoryPoint[];
};

const MARKET_KEYS = {
  capitalisation: ['market_cap', 'market_capitalization', 'capitalisation', 'capitalisation_globale'],
  capitalisationVar: ['market_cap_change_percent', 'capitalisation_variation', 'variation_capitalisation', 'variation_j_cap'],
  volume: ['total_volume', 'volume_moyen_annuel', 'average_volume', 'volume'],
  volumeVar: ['volume_change_percent', 'variation_volume', 'variation_j_vol'],
  value: ['total_value', 'valeur_moyenne_annuelle', 'average_value', 'market_value'],
  valueVar: ['value_change_percent', 'variation_valeur', 'variation_j_val'],
  companies: ['total_companies', 'companies', 'nombre_societes'],
};

export async function fetchMarketStats(): Promise<MarketStats | null> {
  const api = await getJson<any>('/api/v1/market/overview');
  let apiStats: MarketStats | null = null;
  if (api?.overview) {
    const o = api.overview;
    apiStats = {
      date: String(o.date ?? o.trade_date ?? ''),
      total_companies: Number(o.total_companies ?? 0),
      capitalisation_globale: Number(o.market_capitalization ?? o.capitalisation_globale ?? 0),
      variation_j_cap: Number(o.market_cap_change_percent ?? o.variation_j_cap ?? 0),
      volume_moyen_annuel: Number(o.average_volume ?? o.volume_moyen_annuel ?? 0),
      variation_j_vol: Number(o.volume_change_percent ?? o.variation_j_vol ?? 0),
      valeur_moyenne_annuelle: Number(o.average_value ?? o.valeur_moyenne_annuelle ?? 0),
      variation_j_val: Number(o.value_change_percent ?? o.variation_j_val ?? 0),
      history: Array.isArray(api.history)
        ? api.history.map((row: any) => ({
            date: String(row.date ?? row.trade_date ?? ''),
            capitalisation_globale: Number(row.market_capitalization ?? row.capitalisation_globale ?? 0),
            variation_j_cap: Number(row.market_cap_change_percent ?? row.variation_j_cap ?? 0),
            volume_moyen_annuel: Number(row.average_volume ?? row.volume_moyen_annuel ?? 0),
            variation_j_vol: Number(row.volume_change_percent ?? row.variation_j_vol ?? 0),
            valeur_moyenne_annuelle: Number(row.average_value ?? row.valeur_moyenne_annuelle ?? 0),
            variation_j_val: Number(row.value_change_percent ?? row.variation_j_val ?? 0),
          }))
        : [],
    };
  }

  const { data } = await supabase
    .from('new_market_indicators')
    .select('*')
    .order('extraction_date', { ascending: false })
    .limit(45);

  if (!data?.length) {
    return apiStats ?? null;
  }

  const latest = data[0];
  const date = pickDate(latest, DATE_KEYS) ?? apiStats?.date ?? '';
  const history: MarketHistoryPoint[] = data
    .map((row) => ({
      date: pickDate(row, DATE_KEYS) ?? '',
      capitalisation_globale: pickNumber(row, MARKET_KEYS.capitalisation),
      variation_j_cap: pickNumber(row, MARKET_KEYS.capitalisationVar),
      volume_moyen_annuel: pickNumber(row, MARKET_KEYS.volume),
      variation_j_vol: pickNumber(row, MARKET_KEYS.volumeVar),
      valeur_moyenne_annuelle: pickNumber(row, MARKET_KEYS.value),
      variation_j_val: pickNumber(row, MARKET_KEYS.valueVar),
    }))
    .filter((row) => row.date);

  return {
    date,
    total_companies: pickNumber(latest, MARKET_KEYS.companies) ?? apiStats?.total_companies ?? 0,
    capitalisation_globale:
      pickNumber(latest, MARKET_KEYS.capitalisation) ?? apiStats?.capitalisation_globale ?? 0,
    variation_j_cap:
      pickNumber(latest, MARKET_KEYS.capitalisationVar) ?? apiStats?.variation_j_cap ?? 0,
    volume_moyen_annuel:
      pickNumber(latest, MARKET_KEYS.volume) ?? apiStats?.volume_moyen_annuel ?? 0,
    variation_j_vol:
      pickNumber(latest, MARKET_KEYS.volumeVar) ?? apiStats?.variation_j_vol ?? 0,
    valeur_moyenne_annuelle:
      pickNumber(latest, MARKET_KEYS.value) ?? apiStats?.valeur_moyenne_annuelle ?? 0,
    variation_j_val:
      pickNumber(latest, MARKET_KEYS.valueVar) ?? apiStats?.variation_j_val ?? 0,
    history,
  };
}

export type TopMove = {
  symbol: string;
  latest_price: number;
  change_percent: number;
};

function parseTopMoves(payload: any): TopMove[] | null {
  if (!payload) return null;
  const arr = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.gainers)
    ? payload.gainers
    : null;
  if (!arr) return null;
  return arr
    .map((item: any) => ({
      symbol: String(item.symbol ?? item.code ?? item.ticker ?? ''),
      latest_price: Number(item.latest_price ?? item.price ?? item.last_price ?? 0),
      change_percent: Number(
        item.change_percent ?? item.variation ?? item.variation_percent ?? item.daily_change ?? 0
      ),
    }))
    .filter((item: TopMove) => item.symbol);
}

async function fetchTopMoves(path: string, limit: number): Promise<TopMove[] | null> {
  const api = await getJson(path);
  const parsed = parseTopMoves(api);
  if (parsed?.length) {
    return parsed.slice(0, limit);
  }
  return null;
}

export async function fetchTopGainers(limit = 5): Promise<TopMove[]> {
  const api = await fetchTopMoves(`/api/v1/market/gainers/top?limit=${limit}`, limit);
  if (api) return api;

  const { data } = await supabase
    .from('historical_data')
    .select('*')
    .order('trade_date', { ascending: false })
    .limit(limit * 6);

  if (!data?.length) return [];
  const bySymbol = new Map<string, any>();
  for (const row of data) {
    const symbol = row.symbol ?? row.ticker ?? row.code;
    if (!symbol || bySymbol.has(symbol)) continue;
    const change =
      pickNumber(row, ['change_percent', 'variation_percent', 'daily_change_percent']) ?? undefined;
    if (change === undefined) continue;
    bySymbol.set(symbol, {
      symbol,
      latest_price: Number(row.close ?? row.price ?? row.latest_price ?? 0),
      change_percent: change,
    });
  }
  return Array.from(bySymbol.values())
    .sort((a, b) => (b.change_percent ?? 0) - (a.change_percent ?? 0))
    .slice(0, limit);
}

export async function fetchTopLosers(limit = 5): Promise<TopMove[]> {
  const api = await fetchTopMoves(`/api/v1/market/losers/top?limit=${limit}`, limit);
  if (api) return api;

  const { data } = await supabase
    .from('historical_data')
    .select('*')
    .order('trade_date', { ascending: false })
    .limit(limit * 6);

  if (!data?.length) return [];
  const bySymbol = new Map<string, any>();
  for (const row of data) {
    const symbol = row.symbol ?? row.ticker ?? row.code;
    if (!symbol || bySymbol.has(symbol)) continue;
    const change =
      pickNumber(row, ['change_percent', 'variation_percent', 'daily_change_percent']) ?? undefined;
    if (change === undefined) continue;
    bySymbol.set(symbol, {
      symbol,
      latest_price: Number(row.close ?? row.price ?? row.latest_price ?? 0),
      change_percent: change,
    });
  }
  return Array.from(bySymbol.values())
    .sort((a, b) => (a.change_percent ?? 0) - (b.change_percent ?? 0))
    .slice(0, limit);
}

export type CompanyLite = { symbol: string; name?: string; sector?: string };

async function loadCompaniesFromApi(): Promise<CompanyLite[] | null> {
  const api =
    (await getJson('/api/v1/companies')) ??
    (await getJson('/api/v1/market/companies')) ??
    (await getJson('/api/v1/listed-companies'));
  const arr = Array.isArray(api)
    ? api
    : Array.isArray(api?.companies)
    ? api.companies
    : Array.isArray(api?.data)
    ? api.data
    : null;
  if (!arr) return null;
  return arr
    .map((item: any) => ({
      symbol: String(item.symbol ?? item.code ?? item.ticker ?? ''),
      name: item.name ?? item.company_name ?? item.fullname ?? undefined,
      sector: item.sector ?? item.industry ?? undefined,
    }))
    .filter((item: CompanyLite) => item.symbol);
}

export async function fetchCompanies(): Promise<CompanyLite[]> {
  const api = await loadCompaniesFromApi();
  if (api?.length) return api;
  
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('symbol', { ascending: true });
  if (error || !data) return [];
  return data
    .map((row: any) => ({
      symbol: row.symbol ?? row.code ?? row.ticker ?? '',
      name: row.name ?? row.company_name ?? undefined,
      sector: row.sector ?? row.industry ?? undefined,
    }))
    .filter((item: CompanyLite) => item.symbol);
}

export const getCompanies = fetchCompanies;

export type HistoryPoint = {
  date: string;
  price: number;
  volume?: number;
  traded_value?: number;
  high?: number;
  low?: number;
};

export type ForecastPoint = {
  date: string;
  price: number;
  lower?: number;
  upper?: number;
  confidence?: string;
};

export type CompanySeries = {
  history: (HistoryPoint & TechnicalPoint)[];
  forecast: ForecastPoint[];
  last: { date?: string; price?: number; volume?: number; traded_value?: number } | null;
};

type TechnicalPoint = {
  mm5?: number;
  mm10?: number;
  mm20?: number;
  mm50?: number;
  bb_upper?: number;
  bb_mid?: number;
  bb_lower?: number;
  macd?: number;
  signal?: number;
  hist?: number;
  rsi?: number;
  stoch_k?: number;
  stoch_d?: number;
};

export async function fetchCompanySeries(symbol: string): Promise<CompanySeries> {
  const { data: rows } = await supabase
    .from('historical_data')
    .select('*')
    .eq('symbol', symbol)
    .order('trade_date', { ascending: true })
    .limit(260);

  const history: (HistoryPoint & TechnicalPoint)[] = [];
  if (rows?.length) {
    for (const row of rows) {
      const price = Number(row.close ?? row.price ?? row.latest_price ?? row.last_price ?? 0);
      if (!price || !Number.isFinite(price)) continue;
      const historyPoint: HistoryPoint & TechnicalPoint = {
        date: pickDate(row, ['trade_date', 'date', 'day']) ?? '',
        price,
        volume: pickNumber(row, ['volume', 'total_volume', 'shares_traded']),
        traded_value: pickNumber(row, ['traded_value', 'value', 'total_value']),
        high: pickNumber(row, ['high', 'highest_price', 'high_price']),
        low: pickNumber(row, ['low', 'lowest_price', 'low_price']),
      };
      history.push(historyPoint);
    }
  }

  // Calcul des indicateurs techniques
  if (history.length) {
    const closes = history.map((p) => p.price);
    const highs = history.map((p) => p.high ?? p.price);
    const lows = history.map((p) => p.low ?? p.price);

    const mm5 = simpleMovingAverage(closes, 5);
    const mm10 = simpleMovingAverage(closes, 10);
    const mm20 = simpleMovingAverage(closes, 20);
    const mm50 = simpleMovingAverage(closes, 50);
    const bollinger = bollingerBands(closes, 35, 2);
    const macd = macdSeries(closes, 12, 26, 9);
    const rsi = rsiSeries(closes, 20);
    const stoch = stochasticOscillator(closes, highs, lows, 20, 5);

    history.forEach((point, idx) => {
      point.mm5 = mm5[idx];
      point.mm10 = mm10[idx];
      point.mm20 = mm20[idx];
      point.mm50 = mm50[idx];
      point.bb_mid = bollinger.mid[idx];
      point.bb_upper = bollinger.upper[idx];
      point.bb_lower = bollinger.lower[idx];
      point.macd = macd.macd[idx];
      point.signal = macd.signal[idx];
      point.hist = macd.hist[idx];
      point.rsi = rsi[idx];
      point.stoch_k = stoch.k[idx];
      point.stoch_d = stoch.d[idx];
    });
  }

  const forecast: ForecastPoint[] = [];
  const api = await getJson<any>(`/api/v1/predictions/${encodeURIComponent(symbol)}`);
  if (api?.predictions) {
    for (const row of api.predictions) {
      forecast.push({
        date: String(row.prediction_date ?? row.date ?? ''),
        price: Number(row.predicted_price ?? row.price ?? 0),
        lower: pickNumber(row, ['lower_bound', 'lower']),
        upper: pickNumber(row, ['upper_bound', 'upper']),
        confidence: row.confidence_level ?? row.confidence ?? undefined,
      });
    }
  }

  if (!forecast.length) {
    const { data: supaPred } = await supabase
      .from('predictions')
      .select('*')
      .eq('symbol', symbol)
      .order('prediction_date', { ascending: true })
      .limit(40);
    if (supaPred?.length) {
      for (const row of supaPred) {
        forecast.push({
          date: String(row.prediction_date ?? row.date ?? ''),
          price: Number(row.predicted_price ?? row.price ?? 0),
          lower: pickNumber(row, ['lower_bound', 'lower']),
          upper: pickNumber(row, ['upper_bound', 'upper']),
          confidence: row.confidence_level ?? row.confidence ?? undefined,
        });
      }
    }
  }

  const last = history.length ? history[history.length - 1] : null;

  return { history, forecast, last };
}

export type TechnicalSummary = {
  overall: 'Achat' | 'Vente' | 'Neutre' | 'Attendre' | 'Indisponible';
  details: Array<{ name: string; decision: string; value?: string }>;
};

export async function fetchTechnicalSummary(symbol: string): Promise<TechnicalSummary> {
  const api = await getJson<any>(`/api/v1/analysis/${encodeURIComponent(symbol)}/signals`);
  if (api?.overall) {
    return {
      overall: (api.overall as TechnicalSummary['overall']) ?? 'Indisponible',
      details: Array.isArray(api.indicators)
        ? api.indicators.map((item: any) => ({
            name: item.name ?? item.indicator ?? 'Indicateur',
            decision: item.decision ?? item.signal ?? 'N/A',
            value: item.value ?? undefined,
          }))
        : [],
    };
  }

  const { data } = await supabase
    .from('technical_analysis')
    .select('*')
    .eq('symbol', symbol)
    .order('as_of_date', { ascending: false })
    .limit(1);

  if (!data?.length) {
    return { overall: 'Indisponible', details: [] };
  }

  const row = data[0];
  const details = [
    {
      name: 'Moyennes mobiles',
      decision: row.ma_signal ?? row.mm_signal ?? 'N/A',
      value: `MM5: ${row.mm5 ?? '-'} / MM10: ${row.mm10 ?? '-'} / MM20: ${row.mm20 ?? '-'} / MM50: ${row.mm50 ?? '-'}`,
    },
    {
      name: 'Bandes de Bollinger',
      decision: row.bollinger_signal ?? 'N/A',
      value: `Centre: ${row.bb_mid ?? '-'} / Sup: ${row.bb_upper ?? '-'} / Inf: ${row.bb_lower ?? '-'}`,
    },
    {
      name: 'MACD',
      decision: row.macd_signal ?? row.macd_signal_line ?? 'N/A',
      value: `MACD: ${row.macd ?? '-'} / Signal: ${row.macd_signal_line ?? '-'} / Hist: ${row.macd_hist ?? '-'}`,
    },
    {
      name: 'RSI',
      decision: row.rsi_signal ?? 'N/A',
      value: `RSI: ${row.rsi ?? '-'}`,
    },
    {
      name: 'Stochastique',
      decision: row.stoch_signal ?? 'N/A',
      value: `%K: ${row.stoch_k ?? '-'} / %D: ${row.stoch_d ?? '-'}`,
    },
  ];

  const buy = details.filter((item) => /achat/i.test(item.decision ?? '')).length;
  const sell = details.filter((item) => /vente/i.test(item.decision ?? '')).length;
  const overall: TechnicalSummary['overall'] =
    buy > sell ? 'Achat' : sell > buy ? 'Vente' : 'Neutre';

  return { overall, details };
}

export type FundamentalSummary = {
  summary: string;
  last_report?: { title?: string; date?: string; url?: string };
};

export async function fetchFundamentalSummary(symbol: string): Promise<FundamentalSummary> {
  const api = await getJson<any>(`/api/v1/fundamentals/company/${encodeURIComponent(symbol)}`);
  if (api?.summary) {
    return {
      summary: api.summary,
      last_report: api.last_report,
    };
  }

  const { data } = await supabase
    .from('fundamental_analysis')
    .select('*')
    .eq('symbol', symbol)
    .order('analyzed_at', { ascending: false })
    .limit(1);

  if (!data?.length) {
    return { summary: 'Analyse fondamentale indisponible pour le moment.' };
  }

  const row = data[0];
  return {
    summary: row.summary ?? row.synthesis ?? 'Analyse fondamentale indisponible.',
    last_report: {
      title: row.report_title ?? row.document_title,
      date: row.report_date ?? row.document_date,
      url: row.report_url ?? row.document_url,
    },
  };
}

export async function fetchCompanyFundamentals(symbol: string) {
  return fetchFundamentalSummary(symbol);
}

export async function fetchTechnicalGlobalSummary(): Promise<{ summary: string }> {
  const api = await getJson<any>('/api/v1/analysis/technical/summary');
  if (api?.summary) return { summary: api.summary };

  const { data } = await supabase
    .from('technical_analysis')
    .select('overall_signal, symbol')
    .order('as_of_date', { ascending: false })
    .limit(100);

  if (!data?.length) {
    return { summary: 'Les signaux techniques globaux seront bientôt disponibles.' };
  }

  const counts = data.reduce(
    (acc, row) => {
      const signal = String(row.overall_signal ?? '').toLowerCase();
      if (signal.includes('achat')) acc.buy += 1;
      else if (signal.includes('vente')) acc.sell += 1;
      else acc.neutral += 1;
      return acc;
    },
    { buy: 0, sell: 0, neutral: 0 }
  );

  const total = counts.buy + counts.sell + counts.neutral;
  const summary =
    total === 0
      ? 'Les signaux techniques globaux seront bientôt disponibles.'
      : `Signal global: ${counts.buy} achats, ${counts.sell} ventes, ${counts.neutral} neutres sur ${total} sociétés surveillées.`;
  return { summary };
}

export async function fetchFundamentalGlobalSummary(): Promise<{ summary: string }> {
  const api = await getJson<any>('/api/v1/fundamentals/summary');
  if (api?.summary) return { summary: api.summary };

  const { data } = await supabase
    .from('fundamental_analysis')
    .select('symbol, summary, report_title')
    .order('analyzed_at', { ascending: false })
    .limit(20);

  if (!data?.length) {
    return { summary: 'Les derniers rapports fondamentaux seront publiés prochainement.' };
  }

  const highlights = data.slice(0, 5).map((row: any) => {
    const symbol = row.symbol ?? '—';
    const title = row.report_title ?? 'Rapport';
    return `${symbol}: ${title}`;
  });

  return {
    summary: `Derniers rapports analysés — ${highlights.join(' • ')}.`,
  };
}

export async function fetchFundamentalsSummary() {
  return fetchFundamentalGlobalSummary();
}

export async function fetchListings() {
  const companies = await fetchCompanies();
  return { symbols: companies.map((c) => c.symbol) };
}

export async function fetchCompanyQuote(symbol: string) {
  const api = await getJson<any>(`/api/v1/companies/${encodeURIComponent(symbol)}`);
  if (api?.company) {
    const c = api.company;
    const latest = Number(c.latest_price ?? c.price ?? 0);
    return {
      symbol,
      latest_price: latest,
      price: latest,
      change_percent: Number(c.change_percent ?? c.variation ?? 0),
    };
  }

  const { data } = await supabase
    .from('historical_data')
    .select('*')
    .eq('symbol', symbol)
    .order('trade_date', { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;
  const latest = Number(data.close ?? data.price ?? data.latest_price ?? 0);
  return {
    symbol,
    latest_price: latest,
    price: latest,
    change_percent: pickNumber(data, ['change_percent', 'variation_percent', 'daily_change_percent']) ?? 0,
  };
}

export async function fetchQuote(symbol: string) {
  return fetchCompanyQuote(symbol);
}

export async function fetchPredictions(symbol: string) {
  const series = await fetchCompanySeries(symbol);
  return {
    history: series.history.map((row) => ({ date: row.date, price: row.price })),
    forecast: series.forecast,
  };
}

export async function fetchSignals() {
  const { data } = await supabase
    .from('technical_analysis')
    .select('symbol, overall_signal, signal_score')
    .order('as_of_date', { ascending: false })
    .limit(200);

  const buys: Array<{ symbol: string; score: number }> = [];
  const sells: Array<{ symbol: string; score: number }> = [];

  if (data?.length) {
    for (const row of data) {
      const symbol = row.symbol ?? '';
      if (!symbol) continue;
      const score = Number(row.signal_score ?? 0);
      const signal = String(row.overall_signal ?? '').toLowerCase();
      if (signal.includes('achat')) {
        buys.push({ symbol, score: Number.isFinite(score) ? score : 0 });
      } else if (signal.includes('vente')) {
        sells.push({ symbol, score: Number.isFinite(score) ? Math.abs(score) : 0 });
      }
    }
  }

  return { buys, sells };
}

export async function getCompanyPredictions(symbol: string) {
  const { data, error } = await supabase.rpc('get_company_predictions', { symbol });
  if (error) throw error;
  return data;
}

export async function getCompanyAnalysis(symbol: string) {
  const { data, error } = await supabase.rpc('get_company_analysis', { symbol });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function getRecommendations() {
  const api = await getJson<any>('/api/v1/recommendations');
  if (api?.recommendations) return api.recommendations;

  const { data } = await supabase
    .from('technical_analysis')
    .select('symbol, sector, recommendation, overall_signal')
    .order('as_of_date', { ascending: false })
    .limit(200);
  return data ?? [];
}

export async function recordPayment(paymentData: {
  transaction_id: string;
  amount: number;
  status: string;
  user_email?: string;
}) {
  const { error } = await supabase.from('payments').insert([paymentData]);
  if (error) throw error;
  return { success: true };
}

export async function registerUser(user: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  profession?: string;
  age_bracket?: string;
  gender?: string;
}) {
  const { error } = await supabase.from('users').insert([user]);
  if (error) throw error;
  return { success: true };
}

export async function getAllUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data;
}

export async function getIndexEvolution(indexName: string) {
  const { data, error } = await supabase.rpc(`${indexName}_avg_10m`);
  if (error) throw error;
  return data;
}

export async function getMarketOverview() {
  const { data, error } = await supabase
    .from('new_market_indicators')
    .select('*')
    .order('extraction_date', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0];
}

export async function fetchMarketOverview() {
  return getMarketOverview();
}

const INDEX_CODE_MAP: Record<string, string> = {
  composite: 'composite',
  brvm30: 'brvm_30',
  prestige: 'prestige',
  croissance: 'croissance',
};

const INDEX_EVOLUTION_MAP: Record<string, string> = {
  composite: 'brvm_composite',
  brvm30: 'brvm_30',
  prestige: 'brvm_prestige',
  croissance: 'brvm_croissance',
};

export async function getIndexSeries20d(indexKey: string) {
  const code = INDEX_CODE_MAP[indexKey] ?? indexKey;
  const { data } = await supabase.rpc('index_last_20d', { index_code: code });
  if (!data) return [];
  return (data as any[]).map((row) => ({
    d: row.date ?? row.day ?? row.trade_date ?? '',
    v: Number(row.value ?? row.index_value ?? row.price ?? 0),
  }));
}

export async function getIndexSeries10m(indexKey: string) {
  const code = INDEX_EVOLUTION_MAP[indexKey] ?? indexKey;
  const data = await getIndexEvolution(code);
  if (!data) return [];
  return (data as any[]).map((row) => ({
    mois: row.month ?? row.mois ?? row.label ?? '',
    moyenne: Number(row.avg_value ?? row.average ?? row.moyenne ?? row.value ?? 0),
  }));
}

// -----------------------------------------------------------------------------
// Helpers indicateurs techniques
// -----------------------------------------------------------------------------

function simpleMovingAverage(values: number[], period: number): Array<number | undefined> {
  const result: Array<number | undefined> = new Array(values.length).fill(undefined);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) {
      sum -= values[i - period];
    }
    if (i >= period - 1) {
      result[i] = sum / period;
    }
  }
  return result;
}

function exponentialMovingAverage(values: number[], period: number): Array<number | undefined> {
  const result: Array<number | undefined> = new Array(values.length).fill(undefined);
  const multiplier = 2 / (period + 1);
  let emaPrev: number | undefined;
  for (let i = 0; i < values.length; i++) {
    const price = values[i];
    if (emaPrev === undefined) {
      if (i >= period - 1) {
        const window = values.slice(i - period + 1, i + 1);
        emaPrev = window.reduce((acc, v) => acc + v, 0) / period;
        result[i] = emaPrev;
      }
    } else {
      emaPrev = price * multiplier + emaPrev * (1 - multiplier);
      result[i] = emaPrev;
    }
  }
  return result;
}

function bollingerBands(values: number[], period: number, stdDev: number) {
  const mid = simpleMovingAverage(values, period);
  const upper: Array<number | undefined> = new Array(values.length).fill(undefined);
  const lower: Array<number | undefined> = new Array(values.length).fill(undefined);
  for (let i = period - 1; i < values.length; i++) {
    const slice = values.slice(i - period + 1, i + 1);
    const mean = mid[i];
    if (mean === undefined) continue;
    const variance = slice.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    upper[i] = mean + stdDev * std;
    lower[i] = mean - stdDev * std;
  }
  return { mid, upper, lower };
}

function macdSeries(values: number[], fast: number, slow: number, signalPeriod: number) {
  const emaFast = exponentialMovingAverage(values, fast);
  const emaSlow = exponentialMovingAverage(values, slow);
  const macd: Array<number | undefined> = new Array(values.length).fill(undefined);
  for (let i = 0; i < values.length; i++) {
    if (emaFast[i] !== undefined && emaSlow[i] !== undefined) {
      macd[i] = (emaFast[i] as number) - (emaSlow[i] as number);
    }
  }
  const macdValues = macd.map((v) => v ?? 0);
  const signal = exponentialMovingAverage(macdValues, signalPeriod);
  const hist: Array<number | undefined> = macd.map((value, idx) => {
    if (value === undefined || signal[idx] === undefined) return undefined;
    return value - (signal[idx] as number);
  });
  return { macd, signal, hist };
}

function rsiSeries(values: number[], period: number): Array<number | undefined> {
  const result: Array<number | undefined> = new Array(values.length).fill(undefined);
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    if (i <= period) {
      avgGain += gain;
      avgLoss += loss;
      if (i === period) {
        avgGain /= period;
        avgLoss /= period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result[i] = 100 - 100 / (1 + rs);
      }
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result[i] = 100 - 100 / (1 + rs);
    }
  }
  return result;
}

function stochasticOscillator(
  closes: number[],
  highs: number[],
  lows: number[],
  period: number,
  signalPeriod: number
) {
  const k: Array<number | undefined> = new Array(closes.length).fill(undefined);
  for (let i = period - 1; i < closes.length; i++) {
    const highWindow = highs.slice(i - period + 1, i + 1);
    const lowWindow = lows.slice(i - period + 1, i + 1);
    const highest = Math.max(...highWindow);
    const lowest = Math.min(...lowWindow);
    const close = closes[i];
    const range = highest - lowest;
    k[i] = range === 0 ? 50 : ((close - lowest) / range) * 100;
  }
  const kValues = k.map((value) => value ?? 0);
  const dRaw = simpleMovingAverage(kValues, signalPeriod);
  return {
    k,
    d: dRaw,
  };
}
