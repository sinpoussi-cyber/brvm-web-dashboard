import type { CompanyDetail } from '@/types/api';

type ExternalCompany = Partial<CompanyDetail> & Record<string, unknown>;

const freeze = <T>(value: T): T => Object.freeze(value);

const normalizeSearch = (value: string | undefined) => value?.trim().toLowerCase() ?? '';

type NodeModules = {
  fs: typeof import('node:fs');
  path: typeof import('node:path');
};

const FALLBACK_DATA_PATH =
  typeof process !== 'undefined'
    ? process.env.FALLBACK_COMPANIES_PATH ?? process.env.NEXT_PUBLIC_FALLBACK_COMPANIES_PATH
    : undefined;

let cachedCompanies: readonly CompanyDetail[] | null = null;
let attemptedLoad = false;
let cachedNodeModules: NodeModules | null = null;
let attemptedModuleLoad = false;

const getNodeModules = (): NodeModules | null => {
  if (cachedNodeModules) {
    return cachedNodeModules;
  }

  if (attemptedModuleLoad) {
    return null;
  }

  attemptedModuleLoad = true;

  if (typeof window !== 'undefined') {
    return null;
  }

  try {
    const requireFn = eval('require') as ((moduleId: string) => unknown) | undefined;

    if (typeof requireFn !== 'function') {
      return null;
    }

    const fs = requireFn('node:fs') as typeof import('node:fs');
    const path = requireFn('node:path') as typeof import('node:path');

    cachedNodeModules = { fs, path };
    return cachedNodeModules;
  } catch (error) {
    console.warn('[fallback-data] Unable to access Node.js modules', error);
    return null;
  }
};

const sanitizeNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
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

  return null;
};

const sanitizeDate = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return null;
};

const sanitizeText = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  return null;
};

const normalizeCompany = (raw: ExternalCompany, index: number): CompanyDetail | null => {
  const symbol = sanitizeText(raw.symbol) ?? sanitizeText(raw.code) ?? null;
  const name = sanitizeText(raw.name) ?? sanitizeText(raw.label) ?? null;

  if (!symbol || !name) {
    return null;
  }

  const id = typeof raw.id === 'number' ? raw.id : index + 1;
  const sector = sanitizeText(raw.sector);
  const createdAt = sanitizeDate(raw.created_at);
  const currentPrice = sanitizeNumber(raw.current_price) ?? null;
  const priceChange = sanitizeNumber(raw.price_change) ?? null;
  const priceChangePercent = sanitizeNumber(raw.price_change_percent) ?? null;
  const volume = sanitizeNumber(raw.volume) ?? null;
  const marketCap = sanitizeNumber(raw.market_cap) ?? null;

  return {
    id,
    symbol,
    name,
    sector: sector ?? null,
    created_at: createdAt ?? new Date().toISOString(),
    current_price: currentPrice,
    price_change: priceChange,
    price_change_percent: priceChangePercent,
    volume,
    market_cap: marketCap,
  };
};

const loadExternalFallback = (): readonly CompanyDetail[] => {
  if (cachedCompanies) {
    return cachedCompanies;
  }

  if (attemptedLoad) {
    return Object.freeze([] as const);
  }

  attemptedLoad = true;

  if (!FALLBACK_DATA_PATH) {
    return Object.freeze([] as const);
  }

  const nodeModules = getNodeModules();

  if (!nodeModules) {
    return Object.freeze([] as const);
  }

  const { fs, path } = nodeModules;
  
  const resolvedPath = path.isAbsolute(FALLBACK_DATA_PATH)
    ? FALLBACK_DATA_PATH
    : path.join(process.cwd(), FALLBACK_DATA_PATH);

  try {
    const raw = fs.readFileSync(resolvedPath, 'utf8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return Object.freeze([] as const);
    }

    const normalized = parsed
      .map((entry, index) => (entry ? normalizeCompany(entry as ExternalCompany, index) : null))
      .filter((company): company is CompanyDetail => company !== null)
      .map((company) => freeze(company));

    cachedCompanies = freeze(normalized);
    return cachedCompanies;
  } catch (error) {
    console.warn('[fallback-data] Unable to load companies dataset', error);
    return Object.freeze([] as const);
  }
};

export const getFallbackCompanies = (params?: {
  sector?: string;
  search?: string;
}): CompanyDetail[] => {
  const search = normalizeSearch(params?.search);
  const sector = normalizeSearch(params?.sector);

  const candidates = loadExternalFallback();

  if (!search && !sector) {
    return [...candidates];
  }

  return candidates.filter((company) => {
    if (search) {
      const normalizedName = normalizeSearch(company.name);
      const normalizedSymbol = normalizeSearch(company.symbol);
      if (!normalizedName.includes(search) && !normalizedSymbol.includes(search)) {
        return false;
      }
    }

    if (sector) {
      const normalizedSector = normalizeSearch(company.sector ?? undefined);
      if (!normalizedSector.includes(sector)) {
        return false;
      }
    }

    return true;
  });
};
