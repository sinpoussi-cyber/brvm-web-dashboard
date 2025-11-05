import { supabase } from '@/lib/supabaseClient';
import type { RecommendationPayload } from '@/types/recommendations';

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

type CompanyRecord = {
  id: number;
  symbol: string;
  name?: string;
  sector?: string;
};

const companyCache = new Map<string, CompanyRecord>();
const companyIdCache = new Map<number, CompanyRecord>();

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

async function getCompanyRecord(symbol: string): Promise<CompanyRecord | null> {
  if (!symbol) return null;
  const normalized = normalizeSymbol(symbol);
  const cached = companyCache.get(normalized);
  if (cached) return cached;

  const { data: directMatch } = await supabase
    .from('companies')
    .select('id, symbol, name, sector')
    .eq('symbol', normalized)
    .limit(1);

  let row = directMatch?.[0];

  if (!row) {
    const { data: fallback } = await supabase
      .from('companies')
      .select('id, symbol, name, sector')
      .ilike('symbol', normalized)
      .limit(1);
    row = fallback?.[0];
  }

  if (!row) return null;

  const record: CompanyRecord = {
    id: Number(row.id),
    symbol: normalizeSymbol(row.symbol ?? normalized),
    name: row.name ?? undefined,
    sector: row.sector ?? undefined,
  };

  companyCache.set(record.symbol, record);
  companyCache.set(normalized, record);
  companyIdCache.set(record.id, record);
  return record;
}

async function getCompanyById(id: number): Promise<CompanyRecord | null> {
  if (!Number.isFinite(id)) return null;
  const cached = companyIdCache.get(id);
  if (cached) return cached;

  const { data } = await supabase
    .from('companies')
    .select('id, symbol, name, sector')
    .eq('id', id)
    .limit(1);

  const row = data?.[0];
  if (!row) return null;

  const record: CompanyRecord = {
    id: Number(row.id),
    symbol: normalizeSymbol(row.symbol ?? ''),
    name: row.name ?? undefined,
    sector: row.sector ?? undefined,
  };

  if (record.symbol) {
    companyCache.set(record.symbol, record);
  }
  companyIdCache.set(record.id, record);
  return record;
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

function toDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function computeIndexHistory(history: IndexHistoryPoint[]): IndexHistoryPoint[] {
  if (!history?.length) return [];
  const ordered = [...history].map((point) => ({ ...point }));
  ordered.sort((a, b) => {
    const da = Date.parse(a.date ?? '');
    const db = Date.parse(b.date ?? '');
    if (Number.isNaN(da) || Number.isNaN(db)) return 0;
    return da - db;
  });

  const yearBaselines = new Map<number, number>();

  for (let idx = 0; idx < ordered.length; idx += 1) {
    const point = ordered[idx];
    const value = Number(point.value);
    if (!Number.isFinite(value) || value === 0) continue;
    const dateObj = toDate(point.date);
    if (!dateObj) continue;

    if (!yearBaselines.has(dateObj.getFullYear())) {
      yearBaselines.set(dateObj.getFullYear(), value);
    }

    if ((point.variation_daily === undefined || point.variation_daily === null) && idx > 0) {
      const prev = ordered[idx - 1];
      const prevValue = Number(prev.value);
      if (Number.isFinite(prevValue) && prevValue !== 0) {
        point.variation_daily = ((value - prevValue) / prevValue) * 100;
      }
    } else if (point.variation_daily === undefined || point.variation_daily === null) {
      point.variation_daily = 0;
    }

    const baseline = yearBaselines.get(dateObj.getFullYear());
    if ((point.variation_ytd === undefined || point.variation_ytd === null) && baseline && baseline !== 0) {
      point.variation_ytd = ((value - baseline) / baseline) * 100;
    }

    if (point.variation_daily !== undefined && point.variation_daily !== null) {
      point.variation_daily = Number(point.variation_daily);
    }
    if (point.variation_ytd !== undefined && point.variation_ytd !== null) {
      point.variation_ytd = Number(point.variation_ytd);
    }
  }

  return ordered;
}

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
      const mergedHistory =
        update.history && update.history.length
          ? computeIndexHistory(update.history)
          : existing.history ?? [];
      map.set(update.code, {
        ...existing,
        ...update,
        history: mergedHistory,
      });
    } else {
      const history = computeIndexHistory(update.history ?? []);
      map.set(update.code, {
        code: update.code,
        name: update.name ?? update.code,
        value: update.value ?? 0,
        variation_daily: update.variation_daily ?? 0,
        variation_ytd: update.variation_ytd ?? 0,
        history,
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
  const base = INDEX_CONFIGS.map((cfg) => {
    const history = computeIndexHistory(historyMap.get(cfg.code) ?? []).slice(-90);
    const lastPoint = history.length ? history[history.length - 1] : null;
    const fallbackValue = pickNumber(latest, cfg.valueKeys);
    const fallbackDaily = pickNumber(latest, cfg.dailyKeys);
    const fallbackYtd = pickNumber(latest, cfg.ytdKeys);
    return {
      code: cfg.code,
      name: cfg.name,
      history,
      value: lastPoint?.value ?? (fallbackValue ?? 0),
      variation_daily: lastPoint?.variation_daily ?? (fallbackDaily ?? 0),
      variation_ytd: lastPoint?.variation_ytd ?? (fallbackYtd ?? 0),
    };
  });
  
  return mergeIndexData(base, apiIndices);
}

export type MarketHistoryPoint = {
  date: string;
  capitalisation_globale?: number;
  variation_j_cap?: number;
  variation_ytd_cap?: number;
  volume_moyen_annuel?: number;
  variation_j_vol?: number;
  variation_ytd_vol?: number;
  valeur_moyenne_annuelle?: number;
  variation_j_val?: number;
  variation_ytd_val?: number;
};

export type MarketStats = {
  date: string;
  total_companies: number;
  capitalisation_globale: number;
  variation_j_cap: number;
  variation_ytd_cap: number;
  volume_moyen_annuel: number;
  variation_j_vol: number;
  variation_ytd_vol: number;
  valeur_moyenne_annuelle: number;
  variation_j_val: number;
  variation_ytd_val: number;
  history: MarketHistoryPoint[];
};

const MARKET_VARIATION_CONFIG = [
  {
    valueKey: 'capitalisation_globale' as const,
    dailyKey: 'variation_j_cap' as const,
    ytdKey: 'variation_ytd_cap' as const,
  },
  {
    valueKey: 'volume_moyen_annuel' as const,
    dailyKey: 'variation_j_vol' as const,
    ytdKey: 'variation_ytd_vol' as const,
  },
  {
    valueKey: 'valeur_moyenne_annuelle' as const,
    dailyKey: 'variation_j_val' as const,
    ytdKey: 'variation_ytd_val' as const,
  },
] as const;

function computeMarketHistory(history: MarketHistoryPoint[]): MarketHistoryPoint[] {
  if (!history?.length) return [];
  const ordered = [...history].map((row) => ({ ...row }));
  ordered.sort((a, b) => {
    const da = Date.parse(a.date ?? '');
    const db = Date.parse(b.date ?? '');
    if (Number.isNaN(da) || Number.isNaN(db)) return 0;
    return da - db;
  });

  const baselines = new Map<string, number>();

  for (let idx = 0; idx < ordered.length; idx += 1) {
    const row = ordered[idx];
    const dateObj = toDate(row.date);
    if (!dateObj) continue;
    const year = dateObj.getFullYear();

    for (const cfg of MARKET_VARIATION_CONFIG) {
      const rawValue = (row as any)[cfg.valueKey];
      if (rawValue === undefined || rawValue === null) continue;
      const value = Number(rawValue);
      if (!Number.isFinite(value) || value === 0) continue;

      const baseKey = `${cfg.valueKey}-${year}`;
      if (!baselines.has(baseKey)) {
        baselines.set(baseKey, value);
      }

      if (((row as any)[cfg.dailyKey] === undefined || (row as any)[cfg.dailyKey] === null) && idx > 0) {
        const prevRaw = (ordered[idx - 1] as any)[cfg.valueKey];
        if (prevRaw !== undefined && prevRaw !== null) {
          const prevValue = Number(prevRaw);
          if (Number.isFinite(prevValue) && prevValue !== 0) {
            (row as any)[cfg.dailyKey] = ((value - prevValue) / prevValue) * 100;
          }
        }
      } else if ((row as any)[cfg.dailyKey] === undefined || (row as any)[cfg.dailyKey] === null) {
        (row as any)[cfg.dailyKey] = 0;
      }

      const baseline = baselines.get(baseKey);
      if (((row as any)[cfg.ytdKey] === undefined || (row as any)[cfg.ytdKey] === null) && baseline && baseline !== 0) {
        (row as any)[cfg.ytdKey] = ((value - baseline) / baseline) * 100;
      }

      if ((row as any)[cfg.dailyKey] !== undefined && (row as any)[cfg.dailyKey] !== null) {
        (row as any)[cfg.dailyKey] = Number((row as any)[cfg.dailyKey]);
      }
      if ((row as any)[cfg.ytdKey] !== undefined && (row as any)[cfg.ytdKey] !== null) {
        (row as any)[cfg.ytdKey] = Number((row as any)[cfg.ytdKey]);
      }
    }
  }

  return ordered;
}

const MARKET_KEYS = {
  capitalisation: ['market_cap', 'market_capitalization', 'capitalisation', 'capitalisation_globale'],
  capitalisationVar: [
    'market_cap_change_percent',
    'capitalisation_variation',
    'variation_capitalisation',
    'variation_j_cap',
    'variation_journaliere_capitalisation_globale',
  ],
  capitalisationYtd: [
    'market_cap_ytd',
    'variation_ytd_capitalisation',
    'variation_ytd_cap',
    'variation_ytd_capitalisation_globale',
  ],
  volume: ['total_volume', 'volume_moyen_annuel', 'average_volume', 'volume'],
  volumeVar: [
    'volume_change_percent',
    'variation_volume',
    'variation_j_vol',
    'variation_journaliere_volume_moyen_annuel',
  ],
  volumeYtd: [
    'volume_ytd',
    'variation_ytd_volume',
    'variation_ytd_vol',
    'variation_ytd_volume_moyen_annuel',
  ],
  value: ['total_value', 'valeur_moyenne_annuelle', 'average_value', 'market_value'],
  valueVar: [
    'value_change_percent',
    'variation_valeur',
    'variation_j_val',
    'variation_journaliere_valeur_moyenne_annuelle',
  ],
  valueYtd: [
    'value_ytd',
    'variation_ytd_valeur',
    'variation_ytd_val',
    'variation_ytd_valeur_moyenne_annuelle',
  ],
  companies: ['total_companies', 'companies', 'nombre_societes'],
  } as const;

export async function fetchMarketStats(): Promise<MarketStats | null> {
  const api = await getJson<any>('/api/v1/market/overview');
  let apiStats: MarketStats | null = null;
  if (api?.overview) {
    const o = api.overview;
    apiStats = {
      date: String(o.date ?? o.trade_date ?? ''),
      total_companies: Number(o.total_companies ?? 0),
      capitalisation_globale: Number(o.market_capitalization ?? o.capitalisation_globale ?? 0),
      variation_ytd_cap: Number(o.market_cap_ytd ?? o.variation_ytd_cap ?? o.variation_ytd ?? 0),
      variation_j_cap: Number(o.market_cap_change_percent ?? o.variation_j_cap ?? 0),
      volume_moyen_annuel: Number(o.average_volume ?? o.volume_moyen_annuel ?? 0),
      variation_j_vol: Number(o.volume_change_percent ?? o.variation_j_vol ?? 0),
      variation_ytd_vol: Number(o.volume_ytd ?? o.variation_ytd_vol ?? o.variation_ytd_volume ?? 0),
      valeur_moyenne_annuelle: Number(o.average_value ?? o.valeur_moyenne_annuelle ?? 0),
      variation_j_val: Number(o.value_change_percent ?? o.variation_j_val ?? 0),
      variation_ytd_val: Number(o.value_ytd ?? o.variation_ytd_val ?? o.variation_ytd_valeur ?? 0),
      history: Array.isArray(api.history)
        ? api.history.map((row: any) => ({
            date: String(row.date ?? row.trade_date ?? ''),
            capitalisation_globale: Number(row.market_capitalization ?? row.capitalisation_globale ?? 0),
            variation_j_cap: Number(row.market_cap_change_percent ?? row.variation_j_cap ?? 0),
            variation_ytd_cap: Number(
              row.market_cap_ytd ?? row.variation_ytd_cap ?? row.variation_ytd_capitalisation ?? 0
            ),
            volume_moyen_annuel: Number(row.average_volume ?? row.volume_moyen_annuel ?? 0),
            variation_j_vol: Number(row.volume_change_percent ?? row.variation_j_vol ?? 0),
            variation_ytd_vol: Number(
              row.volume_ytd ?? row.variation_ytd_vol ?? row.variation_ytd_volume ?? 0
            ),
            valeur_moyenne_annuelle: Number(row.average_value ?? row.valeur_moyenne_annuelle ?? 0),
            variation_j_val: Number(row.value_change_percent ?? row.variation_j_val ?? 0),
            variation_ytd_val: Number(
              row.value_ytd ?? row.variation_ytd_val ?? row.variation_ytd_valeur ?? 0
            ),
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
  const historyRaw: MarketHistoryPoint[] = data
    .map((row) => ({
      date: pickDate(row, DATE_KEYS) ?? '',
      capitalisation_globale: pickNumber(row, MARKET_KEYS.capitalisation),
      variation_j_cap: pickNumber(row, MARKET_KEYS.capitalisationVar),
      variation_ytd_cap: pickNumber(row, MARKET_KEYS.capitalisationYtd),
      volume_moyen_annuel: pickNumber(row, MARKET_KEYS.volume),
      variation_j_vol: pickNumber(row, MARKET_KEYS.volumeVar),
      variation_ytd_vol: pickNumber(row, MARKET_KEYS.volumeYtd),
      valeur_moyenne_annuelle: pickNumber(row, MARKET_KEYS.value),
      variation_j_val: pickNumber(row, MARKET_KEYS.valueVar),
      variation_ytd_val: pickNumber(row, MARKET_KEYS.valueYtd),
    }))
    .filter((row) => row.date);

  const computedHistory = computeMarketHistory(historyRaw);
  const lastPoint = computedHistory.length ? computedHistory[computedHistory.length - 1] : null;
  const limitedHistory = computedHistory.slice(-90);

  return {
    date,
    total_companies: pickNumber(latest, MARKET_KEYS.companies) ?? apiStats?.total_companies ?? 0,
    capitalisation_globale:
      lastPoint?.capitalisation_globale ??
      pickNumber(latest, MARKET_KEYS.capitalisation) ??
      apiStats?.capitalisation_globale ??
      0,
    variation_j_cap:
      lastPoint?.variation_j_cap ??
      pickNumber(latest, MARKET_KEYS.capitalisationVar) ??
      apiStats?.variation_j_cap ??
      0,
    variation_ytd_cap:
      lastPoint?.variation_ytd_cap ??
      pickNumber(latest, MARKET_KEYS.capitalisationYtd) ??
      apiStats?.variation_ytd_cap ??
      0,
    volume_moyen_annuel:
      lastPoint?.volume_moyen_annuel ??
      pickNumber(latest, MARKET_KEYS.volume) ??
      apiStats?.volume_moyen_annuel ??
      0,
    variation_j_vol:
      lastPoint?.variation_j_vol ??
      pickNumber(latest, MARKET_KEYS.volumeVar) ??
      apiStats?.variation_j_vol ??
      0,
    variation_ytd_vol:
      lastPoint?.variation_ytd_vol ??
      pickNumber(latest, MARKET_KEYS.volumeYtd) ??
      apiStats?.variation_ytd_vol ??
      0,
    valeur_moyenne_annuelle:
      lastPoint?.valeur_moyenne_annuelle ??
      pickNumber(latest, MARKET_KEYS.value) ??
      apiStats?.valeur_moyenne_annuelle ??
      0,
    variation_j_val:
      lastPoint?.variation_j_val ??
      pickNumber(latest, MARKET_KEYS.valueVar) ??
      apiStats?.variation_j_val ??
      0,
    variation_ytd_val:
      lastPoint?.variation_ytd_val ??
      pickNumber(latest, MARKET_KEYS.valueYtd) ??
      apiStats?.variation_ytd_val ??
      0,
    history: limitedHistory,
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

async function loadTopMovesFromSupabase(limit: number, order: 'asc' | 'desc'): Promise<TopMove[]> {
  const { data } = await supabase
    .from('historical_data')
    .select('company_id, symbol, price, close, latest_price, change_percent, variation_percent, daily_change_percent')
    .order('trade_date', { ascending: false })
    .limit(limit * 40);

  if (!data?.length) return [];
  type Prepared = {
    companyId: number | null;
    symbol: string;
    price: number;
    change: number | null;
  };

  const prepared: Prepared[] = data.map((row: any) => ({
    companyId: typeof row.company_id === 'number' ? row.company_id : null,
    symbol: row.symbol ? normalizeSymbol(String(row.symbol)) : '',
    price: Number(row.price ?? row.close ?? row.latest_price ?? 0),
    change: pickNumber(row, ['change_percent', 'variation_percent', 'daily_change_percent']) ?? null,
  }));

  const missingIds = Array.from(
    new Set(prepared.filter((item) => !item.symbol && item.companyId !== null).map((item) => item.companyId as number))
  );

  if (missingIds.length) {
    const { data: companyRows } = await supabase
      .from('companies')
      .select('id, symbol')
      .in('id', missingIds);
    const map = new Map<number, string>();
    companyRows?.forEach((row: any) => {
      if (row?.id && row?.symbol) {
        const recordSymbol = normalizeSymbol(String(row.symbol));
        map.set(Number(row.id), recordSymbol);
        companyCache.set(recordSymbol, {
          id: Number(row.id),
          symbol: recordSymbol,
        });
        companyIdCache.set(Number(row.id), {
          id: Number(row.id),
          symbol: recordSymbol,
        });
      }
    });
    prepared.forEach((item) => {
      if (!item.symbol && item.companyId !== null && map.has(item.companyId)) {
        item.symbol = map.get(item.companyId)!;
      }
    });
  }

  const bySymbol = new Map<string, TopMove>();
  for (const row of prepared) {
    if (!row.symbol || row.change === null || bySymbol.has(row.symbol)) continue;
    bySymbol.set(row.symbol, {
      symbol: row.symbol,
      latest_price: Number.isFinite(row.price) ? row.price : 0,
      change_percent: row.change,
    });
  }

  
  const arr = Array.from(bySymbol.values());
  arr.sort((a, b) =>
    order === 'desc'
      ? (b.change_percent ?? 0) - (a.change_percent ?? 0)
      : (a.change_percent ?? 0) - (b.change_percent ?? 0)
  );
  return arr.slice(0, limit);
}

export async function fetchTopGainers(limit = 5): Promise<TopMove[]> {
  const api = await fetchTopMoves(`/api/v1/market/gainers/top?limit=${limit}`, limit);
  if (api) return api;

  return loadTopMovesFromSupabase(limit, 'desc');
}

export async function fetchTopLosers(limit = 5): Promise<TopMove[]> {
  const api = await fetchTopMoves(`/api/v1/market/losers/top?limit=${limit}`, limit);
  if (api) return api;

  return loadTopMovesFromSupabase(limit, 'asc');
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


  
  const companySeriesCache = new Map<string, CompanySeries>();
  
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
  const normalized = normalizeSymbol(symbol);
  const cached = companySeriesCache.get(normalized);
  if (cached) return cached;

  const company = await getCompanyRecord(normalized);
  if (!company) {
    const empty: CompanySeries = { history: [], forecast: [], last: null };
    companySeriesCache.set(normalized, empty);
    return empty;
  }

  const { data: rawRows } = await supabase
    .from('historical_data')
    .select('trade_date, price, close, latest_price, volume, value, high, low, company_id')
    .eq('company_id', company.id)
    .order('trade_date', { ascending: false })
    .limit(420);

  const sorted = (rawRows ?? []).sort((a, b) => {
    const da = Date.parse(String(a.trade_date ?? ''));
    const db = Date.parse(String(b.trade_date ?? ''));
    if (!Number.isNaN(da) && !Number.isNaN(db)) return da - db;
    return 0;
  });

  const allHistory: (HistoryPoint & TechnicalPoint)[] = [];
  for (const row of sorted) {
    const price = Number(row.close ?? row.price ?? row.latest_price ?? 0);
    if (!Number.isFinite(price) || price <= 0) continue;
    const historyPoint: HistoryPoint & TechnicalPoint = {
      date: pickDate(row, ['trade_date', 'date', 'day']) ?? '',
      price,
      volume: pickNumber(row, ['volume', 'total_volume', 'shares_traded']),
      traded_value: pickNumber(row, ['value', 'traded_value', 'total_value']),
      high: pickNumber(row, ['high', 'highest_price', 'high_price']),
      low: pickNumber(row, ['low', 'lowest_price', 'low_price']),
    };
    allHistory.push(historyPoint);
  }

  if (allHistory.length) {
    const closes = allHistory.map((p) => p.price);
    const highs = allHistory.map((p) => p.high ?? p.price);
    const lows = allHistory.map((p) => p.low ?? p.price);
    
    const mm5 = simpleMovingAverage(closes, 5);
    const mm10 = simpleMovingAverage(closes, 10);
    const mm20 = simpleMovingAverage(closes, 20);
    const mm50 = simpleMovingAverage(closes, 50);
    const bollinger = bollingerBands(closes, 35, 2);
    const macd = macdSeries(closes, 12, 26, 9);
    const rsi = rsiSeries(closes, 20);
    const stoch = stochasticOscillator(closes, highs, lows, 20, 5);

    allHistory.forEach((point, idx) => {
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

  const startOfYear = new Date();
  startOfYear.setMonth(0, 1);
  startOfYear.setHours(0, 0, 0, 0);
  const startDate = startOfYear.toISOString().slice(0, 10);
  const filtered = allHistory.filter((point) => !point.date || point.date >= startDate);
  const history = filtered.length ? filtered : allHistory;

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
      .select('prediction_date, predicted_price, lower_bound, upper_bound, confidence_level, company_id')
      .eq('company_id', company.id)
      .order('prediction_date', { ascending: true })
      .limit(60);
    supaPred?.forEach((row: any) => {
      forecast.push({
        date: String(row.prediction_date ?? row.date ?? ''),
        price: Number(row.predicted_price ?? row.price ?? 0),
        lower: pickNumber(row, ['lower_bound', 'lower']),
        upper: pickNumber(row, ['upper_bound', 'upper']),
        confidence: row.confidence_level ?? row.confidence ?? undefined,
      });
    });    
  }

  const latestPoint = allHistory.length ? allHistory[allHistory.length - 1] : null;
  const last = latestPoint
    ? {
        date: latestPoint.date,
        price: latestPoint.price,
        volume: latestPoint.volume,
        traded_value: latestPoint.traded_value,
      }
    : null;
  
  const series: CompanySeries = { history, forecast, last };
  companySeriesCache.set(normalized, series);
  if (company.symbol && company.symbol !== normalized) {
    companySeriesCache.set(company.symbol, series);
  }
  return series;
}

export type TechnicalSummary = {
  overall: 'Achat' | 'Vente' | 'Neutre' | 'Attendre' | 'Indisponible';
  details: Array<{ name: string; decision: string; value?: string }>;
};

  const percentFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const priceFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 2,
});
  
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

  const series = await fetchCompanySeries(symbol);
  const history = series.history;
  if (!history.length) {
    return { overall: 'Indisponible', details: [] };
  }

   const last = history[history.length - 1];
  const prev = history.length > 1 ? history[history.length - 2] : last;

  const toPrice = (value?: number) =>
    value === undefined || value === null || Number.isNaN(Number(value))
      ? '-'
      : priceFormatter.format(Number(value));

  const toPercent = (value?: number) =>
    value === undefined || value === null || Number.isNaN(Number(value))
      ? '-'
      : percentFormatter.format(Number(value));

  const maSignals = [
    last.mm5 !== undefined && last.mm20 !== undefined ? last.mm5 - last.mm20 : 0,
    last.mm20 !== undefined && last.mm50 !== undefined ? last.mm20 - last.mm50 : 0,
    last.price !== undefined && last.mm20 !== undefined ? last.price - last.mm20 : 0,
  ];
  const maPositives = maSignals.filter((value) => value > 0).length;
  const maNegatives = maSignals.filter((value) => value < 0).length;
  let maDecision: TechnicalSummary['overall'] = 'Neutre';
  if (maPositives > maNegatives) maDecision = 'Achat';
  else if (maNegatives > maPositives) maDecision = 'Vente';

  let bollDecision: TechnicalSummary['overall'] = 'Neutre';
  if (last.price !== undefined && last.bb_upper !== undefined && last.price >= last.bb_upper) {
    bollDecision = 'Vente';
  } else if (last.price !== undefined && last.bb_lower !== undefined && last.price <= last.bb_lower) {
    bollDecision = 'Achat';
  }

  let macdDecision: TechnicalSummary['overall'] = 'Neutre';
  if (last.macd !== undefined && last.signal !== undefined) {
    if (last.macd > last.signal) macdDecision = 'Achat';
    else if (last.macd < last.signal) macdDecision = 'Vente';
  }

  let rsiDecision: TechnicalSummary['overall'] = 'Neutre';
  if (last.rsi !== undefined) {
    if (last.rsi <= 30) rsiDecision = 'Achat';
    else if (last.rsi >= 70) rsiDecision = 'Vente';
  }

  let stochDecision: TechnicalSummary['overall'] = 'Neutre';
  if (last.stoch_k !== undefined) {
    if (last.stoch_k <= 20) stochDecision = 'Achat';
    else if (last.stoch_k >= 80) stochDecision = 'Vente';
  }

  const dailyChange =
    last.price !== undefined && prev.price !== undefined
      ? ((last.price - prev.price) / prev.price) * 100
      : undefined;
  
  const details = [
    {
      name: 'Cours',
      decision: dailyChange !== undefined ? (dailyChange >= 0 ? 'Hausse journalière' : 'Baisse journalière') : 'N/A',
      value:
        last.price !== undefined
          ? `${toPrice(last.price)} FCFA (${dailyChange !== undefined ? `${toPercent(dailyChange)}%` : '—'})`
          : undefined,
    },
    {
      name: 'Moyennes mobiles',
      decision: maDecision,
      value: `MM5: ${toPrice(last.mm5)} / MM20: ${toPrice(last.mm20)} / MM50: ${toPrice(last.mm50)}`,
    },
    {
      name: 'Bandes de Bollinger',
      decision: bollDecision,
      value: `Centre: ${toPrice(last.bb_mid)} / Sup: ${toPrice(last.bb_upper)} / Inf: ${toPrice(last.bb_lower)}`,
    },
    {
      name: 'MACD',
      decision: macdDecision,
      value: `MACD: ${toPrice(last.macd)} / Signal: ${toPrice(last.signal)} / Hist: ${toPrice(last.hist)}`,
    },
    {
      name: 'RSI',
      decision: rsiDecision,
      value: last.rsi !== undefined ? `${toPercent(last.rsi)} pts` : undefined,
    },
    {
      name: 'Stochastique',
      decision: stochDecision,
      value:
        last.stoch_k !== undefined
          ? `%K: ${toPercent(last.stoch_k)} / %D: ${toPercent(last.stoch_d)}`
          : undefined,
    },
  ];

  const buy = details.filter((item) => /achat/i.test(item.decision ?? '')).length;
  const sell = details.filter((item) => /vente|baisse/i.test(item.decision ?? '')).length;
  const overall: TechnicalSummary['overall'] =
    buy > sell ? 'Achat' : sell > buy ? 'Vente' : 'Neutre';

  return { overall, details };
}

export type FundamentalSummary = {
  summary: string;
  last_report?: { title?: string; date?: string; url?: string };
};

function interpretPer(per?: number | null) {
  if (per === undefined || per === null || Number.isNaN(Number(per))) return null;
  if (per <= 8) return 'valorisation attractive';
  if (per >= 22) return 'valorisation exigeante';
  return 'valorisation en ligne avec le marché';
}

function interpretPbr(pbr?: number | null) {
  if (pbr === undefined || pbr === null || Number.isNaN(Number(pbr))) return null;
  if (pbr <= 1) return 'décote par rapport aux capitaux propres';
  if (pbr >= 2) return 'prime significative sur les fonds propres';
  return 'valorisation équilibrée';
}

function interpretRoe(roe?: number | null) {
  if (roe === undefined || roe === null || Number.isNaN(Number(roe))) return null;
  if (roe >= 15) return 'rentabilité élevée';
  if (roe <= 5) return 'rentabilité limitée';
  return 'rentabilité correcte';
}

function interpretDividend(dividend?: number | null) {
  if (dividend === undefined || dividend === null || Number.isNaN(Number(dividend))) return null;
  if (dividend >= 5) return 'rendement généreux';
  if (dividend <= 2) return 'rendement modeste';
  return 'rendement en ligne avec le marché';
}

function buildFundamentalNarrative(row: {
  symbol?: string;
  company_name?: string;
  summary?: string | null;
  recommendation?: string | null;
  per?: number | null;
  pbr?: number | null;
  roe?: number | null;
  roa?: number | null;
  dividend_yield?: number | null;
}) {
  if (!row) return 'Analyse fondamentale indisponible pour le moment.';
  const chunks: string[] = [];
  if (row.summary) {
    chunks.push(String(row.summary).trim());
  }

  const ratioInsights: string[] = [];
  if (row.per !== undefined && row.per !== null) {
    const insight = interpretPer(Number(row.per));
    ratioInsights.push(`PER à ${Number(row.per).toFixed(1)}x${insight ? ` (${insight})` : ''}`);
  }
  if (row.pbr !== undefined && row.pbr !== null) {
    const insight = interpretPbr(Number(row.pbr));
    ratioInsights.push(`P/BV de ${Number(row.pbr).toFixed(1)}${insight ? ` (${insight})` : ''}`);
  }
  if (row.roe !== undefined && row.roe !== null) {
    const insight = interpretRoe(Number(row.roe));
    ratioInsights.push(`ROE ${Number(row.roe).toFixed(1)} %${insight ? ` (${insight})` : ''}`);
  }
  if (row.roa !== undefined && row.roa !== null) {
    ratioInsights.push(`ROA ${Number(row.roa).toFixed(1)} %`);
  }
  if (row.dividend_yield !== undefined && row.dividend_yield !== null) {
    const insight = interpretDividend(Number(row.dividend_yield));
    ratioInsights.push(`Dividende ${Number(row.dividend_yield).toFixed(2)} %${insight ? ` (${insight})` : ''}`);
  }

  if (ratioInsights.length) {
    chunks.push(ratioInsights.join(' • '));
  }

  if (row.recommendation) {
    chunks.push(`Recommandation actuelle : ${row.recommendation}.`);
  }

  if (!chunks.length) {
    chunks.push('Les indicateurs fondamentaux seront publiés prochainement.');
  }

  return chunks.join(' ');
}
  
  export async function fetchFundamentalSummary(symbol: string): Promise<FundamentalSummary> {
  const api = await getJson<any>(`/api/v1/fundamentals/company/${encodeURIComponent(symbol)}`);
  if (api?.summary) {
    return {
      summary: api.summary,
      last_report: api.last_report,
    };
  }

    const normalized = normalizeSymbol(symbol);
    const { data: fundamentalRows } = await supabase
    .from('fundamental_data')
    .select(
      'summary, recommendation, report_title, report_date, report_url, symbol, per, pbr, roe, roa, dividend_yield'
    )
    .eq('symbol', normalized)
    .order('report_date', { ascending: false })
    .limit(1);

  if (fundamentalRows?.length) {
    const row = fundamentalRows[0];
    return {
      summary: buildFundamentalNarrative(row),
      last_report: {
        title: row.report_title ?? undefined,
        date: row.report_date ?? undefined,
        url: row.report_url ?? undefined,
      },
    };
  }

  const company = await getCompanyRecord(normalized);
  if (!company) {
    return { summary: 'Analyse fondamentale indisponible pour le moment.' };
  }

  const { data: analysisRows } = await supabase
    .from('fundamental_analysis')
    .select('analysis_summary, report_title, report_date, report_url, company_id')
    .eq('company_id', company.id)
    .order('report_date', { ascending: false })
    .limit(1);

  if (analysisRows?.length) {
    const row = analysisRows[0];
    let summaryText = row.analysis_summary ?? '';
    if (!summaryText) {
      const metrics = await fetchFundamentalMetrics(symbol);
      summaryText = buildFundamentalNarrative({
        symbol,
        company_name: company.name,
        summary: row.analysis_summary,
        recommendation: metrics?.recommendation ?? null,
        per: metrics?.per ?? null,
        pbr: metrics?.pbr ?? null,
        roe: metrics?.roe ?? null,
        roa: metrics?.roa ?? null,
        dividend_yield: metrics?.dividend_yield ?? null,
      });
    }
    return {
      summary: summaryText || 'Analyse fondamentale indisponible pour le moment.',
      last_report: {
        title: row.report_title ?? undefined,
        date: row.report_date ?? undefined,
        url: row.report_url ?? undefined,
      },
    };
  }

  return { summary: 'Analyse fondamentale indisponible pour le moment.' };
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

  let summaryParts: string[] = [];
  if (data?.length) {
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
    if (total > 0) {
      summaryParts.push(
        `Signaux consolidés : ${counts.buy} achats, ${counts.sell} ventes, ${counts.neutral} neutres (${total} sociétés suivies)`
      );
    }
  }

const { data: techData } = await supabase
    .from('technical_data')
    .select('symbol, rsi, macd, signal, histogram, trend, ma20, ma50, trade_date')
    .order('trade_date', { ascending: false })
    .limit(400);

  if (techData?.length) {
    const seen = new Set<string>();
    const latestBySymbol: any[] = [];
    for (const row of techData) {
      const symbol = String(row.symbol ?? '').toUpperCase();
      if (!symbol || seen.has(symbol)) continue;
      seen.add(symbol);
      latestBySymbol.push(row);
    }

    const oversold = latestBySymbol.filter((row) => Number(row.rsi ?? 0) <= 30).length;
    const overbought = latestBySymbol.filter((row) => Number(row.rsi ?? 0) >= 70).length;
    const macdPositive = latestBySymbol.filter((row) => Number(row.macd ?? 0) > Number(row.signal ?? 0)).length;
    const bullishTrends = latestBySymbol.filter((row) =>
      String(row.trend ?? '').toLowerCase().includes('haus') ||
      Number(row.ma20 ?? 0) > Number(row.ma50 ?? 0)
    ).length;

    if (latestBySymbol.length) {
      summaryParts.push(
        `RSI : ${oversold} survendus / ${overbought} surachetés`,
        `MACD haussier sur ${macdPositive} valeurs`,
        `Tendance haussière détectée sur ${bullishTrends} titres`
      );
    }
  }

  if (!summaryParts.length) {
    return { summary: 'Les signaux techniques globaux seront bientôt disponibles.' };
  }  

  return { summary: summaryParts.join('. ') + '.' };
}

export async function fetchFundamentalGlobalSummary(): Promise<{ summary: string }> {
  const api = await getJson<any>('/api/v1/fundamentals/summary');
  if (api?.summary) return { summary: api.summary };

  const { data } = await supabase
    .from('fundamental_data')
    .select('symbol, recommendation, summary, report_title, report_date, per, pbr, roe, roa, dividend_yield')
    .order('report_date', { ascending: false })
    .limit(20);

  if (!data?.length) {
    return { summary: 'Les derniers rapports fondamentaux seront publiés prochainement.' };
  }

  const perValues = data
    .map((row: any) => Number(row.per ?? row.per_ratio))
    .filter((value) => Number.isFinite(value));
  const roeValues = data
    .map((row: any) => Number(row.roe ?? row.roe_percent))
    .filter((value) => Number.isFinite(value));
  const dividendLeaders = data
    .filter((row: any) => Number.isFinite(Number(row.dividend_yield)))
    .sort((a: any, b: any) => Number(b.dividend_yield ?? 0) - Number(a.dividend_yield ?? 0))
    .slice(0, 3)
    .map(
      (row: any) =>
        `${row.symbol}: ${(Number(row.dividend_yield ?? 0)).toFixed(1)} %`
    );

  const buySignals = data
    .filter((row: any) => /achat|buy/i.test(String(row.recommendation ?? row.summary ?? '')))
    .map((row: any) => row.symbol)
    .filter(Boolean)
    .slice(0, 5);

  const avgPer = perValues.length
    ? perValues.reduce((sum, value) => sum + value, 0) / perValues.length
    : null;
  const medianRoe = (() => {
    if (!roeValues.length) return null;
    const sorted = [...roeValues].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  })();

  const parts: string[] = [];
  parts.push(`Échantillon de ${data.length} sociétés analysées`);
  if (avgPer !== null) parts.push(`PER moyen ${avgPer.toFixed(1)}x`);
  if (medianRoe !== null) parts.push(`ROE médian ${medianRoe.toFixed(1)} %`);
  if (dividendLeaders.length) parts.push(`Meilleurs rendements : ${dividendLeaders.join(', ')}`);
  if (buySignals.length) parts.push(`Signaux d’achat actifs : ${buySignals.join(', ')}`);
  
  return {
    summary: parts.join('. ') + '.',
  };
}

export async function fetchFundamentalsSummary() {
  return fetchFundamentalGlobalSummary();
}

export type FundamentalMetrics = {
  symbol: string;
  company_name?: string;
  per?: number;
  pbr?: number;
  roe?: number;
  roa?: number;
  dividend_yield?: number;
  recommendation?: string;
  summary?: string;
  report_date?: string;
};

export async function fetchFundamentalMetrics(symbol: string): Promise<FundamentalMetrics | null> {
  const normalized = normalizeSymbol(symbol);
  const { data } = await supabase
    .from('fundamental_data')
    .select(
      'symbol, company_name, per, pbr, roe, roa, dividend_yield, recommendation, summary, report_date'
    )
    .eq('symbol', normalized)
    .order('report_date', { ascending: false })
    .limit(1);

  if (!data?.length) return null;
  const record = data[0] as FundamentalMetrics;
  if (!record.summary || String(record.summary).trim().length === 0) {
    record.summary = buildFundamentalNarrative(record);
  }
  return record;
}

export async function fetchFundamentalLeaders(limit = 20) {
  const { data } = await supabase
    .from('fundamental_data')
    .select(
      'symbol, company_name, per, pbr, roe, roa, dividend_yield, recommendation, summary, report_date'
    )
    .order('report_date', { ascending: false })
    .limit(limit);
  return data ?? [];
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
  
  const company = await getCompanyRecord(symbol);
  if (!company) return null;
  
  const { data } = await supabase
    .from('historical_data')
    .select('price, close, latest_price, change_percent, variation_percent, daily_change_percent')
    .eq('company_id', company.id)
    .order('trade_date', { ascending: false })
    .limit(1);

  const row = data?.[0];
  if (!row) return null;
  const latest = Number(row.close ?? row.price ?? row.latest_price ?? 0);
  return {
    symbol: company.symbol,
    latest_price: latest,
    price: latest,
    change_percent: pickNumber(row, ['change_percent', 'variation_percent', 'daily_change_percent']) ?? 0,
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
    .from('recommendations')
    .select('symbol, recommendation, variation_pred')
    .order('updated_at', { ascending: false })
    .limit(200);

  const buys: Array<{ symbol: string; score: number }> = [];
  const sells: Array<{ symbol: string; score: number }> = [];

  if (data?.length) {
    for (const row of data) {
      const symbol = normalizeSymbol(row.symbol ?? '');
      if (!symbol) continue;
       const score = Number(row.variation_pred ?? 0);
       const signal = String(row.recommendation ?? '').toLowerCase();
       if (signal.includes('achat') || signal.includes('buy')) {
        buys.push({ symbol, score: Number.isFinite(score) ? score : 0 });
       } else if (signal.includes('vente') || signal.includes('sell')) {
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

export async function getRecommendations(): Promise<RecommendationPayload> {
  if (typeof window !== 'undefined') {
    const response = await fetch('/api/recommendations', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Impossible de récupérer les recommandations.');
    }
    return (await response.json()) as RecommendationPayload;
  }
  
  const { buildRecommendationsDataset } = await import('@/lib/server/recommendations');
  return buildRecommendationsDataset();
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
