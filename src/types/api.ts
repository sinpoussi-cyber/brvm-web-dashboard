// ==============================================================================
// TYPES API - Tous les types pour les réponses API
// ==============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export interface ApiError {
  detail: string;
  status: number;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Auth
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type?: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

// Market Data
export interface PriceData {
  date: string;
  price: number;
  volume?: number;
  value?: number;
}

export interface Quote {
  symbol: string;
  name: string;
  current_price: number;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  volume?: number;
  value?: number;
  change?: number;
  change_percent?: number;
  last_update: string;
}

export interface TopCompany {
  symbol: string;
  name: string;
  current_price: number;
  change: number;
  change_percent: number;
  volume?: number;
}

// Technical Analysis
export interface TechnicalIndicators {
  date: string;
  mm5?: number;
  mm10?: number;
  mm20?: number;
  mm50?: number;
  mm_decision?: string;
  bollinger_central?: number;
  bollinger_inferior?: number;
  bollinger_superior?: number;
  bollinger_decision?: string;
  macd_line?: number;
  signal_line?: number;
  histogram?: number;
  macd_decision?: string;
  rsi?: number;
  rsi_decision?: string;
  stochastic_k?: number;
  stochastic_d?: number;
  stochastic_decision?: string;
}

export interface SignalResponse {
  symbol: string;
  overall_signal: 'Achat' | 'Vente' | 'Neutre';
  signal_strength: number;
  indicators: TechnicalIndicators;
  recommendation: string;
}

// Predictions
export interface Prediction {
  prediction_date: string;
  predicted_price: number;
  lower_bound?: number;
  upper_bound?: number;
  confidence_level?: string;
}

export interface PredictionResponse {
  symbol: string;
  current_price: number;
  predictions: Prediction[];
  average_change_percent: number;
  trend: 'haussière' | 'baissière' | 'stable';
}

// Sector Performance
export interface SectorPerformance {
  sector: string;
  company_count: number;
  avg_change_percent: number;
  max_change_percent: number;
  min_change_percent: number;
  top_performers: string;
}

export interface SectorPerformanceResponse {
  period_days: number;
  sectors: SectorPerformance[];
}

// Comparable Companies
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

// User Preferences
export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'fr' | 'en';
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  default_currency: string;
  favorite_sectors: string[];
  watchlist_view: 'grid' | 'list';
  chart_type: 'candlestick' | 'line' | 'area';
  updated_at?: string;
}
