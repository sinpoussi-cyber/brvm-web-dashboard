// ==============================================================================
// TYPES COMPANY - Types pour les sociétés cotées
// ==============================================================================

export interface Company {
  id: number;
  symbol: string;
  name: string;
  sector: string | null;
  created_at: string;
}

export interface CompanyDetail extends Company {
  current_price: number | null;
  price_change: number | null;
  price_change_percent: number | null;
  volume: number | null;
  market_cap: number | null;
}

export interface CompanyFilters {
  sector?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minChangePercent?: number;
  maxChangePercent?: number;
}

export interface Sector {
  sector: string;
  company_count: number;
}

// Types pour les sociétés comparables
export interface ComparableCompany {
  symbol: string;
  name: string;
  sector: string;
  current_price: number;
  change_percent: number;
  volume?: number;
  mm_decision?: string;
  rsi_decision?: string;
  similarity_score: number;
}

export interface ComparableCompaniesResponse {
  symbol: string;
  sector: string;
  comparable_companies: ComparableCompany[];
}
