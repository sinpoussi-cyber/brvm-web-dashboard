// ==============================================================================
// TYPES USER - Types pour les utilisateurs
// ==============================================================================

export type UserType = 'retail' | 'sgi' | 'sgo' | 'brvm' | 'admin';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: UserType;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface UserProfile extends User {
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
}

export interface Alert {
  id: string;
  user_id: string;
  company_id: number;
  symbol: string;
  company_name: string;
  alert_type: 'price_above' | 'price_below' | 'signal_buy' | 'signal_sell';
  threshold_value?: number;
  current_price?: number;
  is_active: boolean;
  triggered_at?: string;
  created_at: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  current_price: number;
  change_percent: number;
  volume?: number;
  mm_decision?: string;
  rsi_decision?: string;
  notes?: string;
}
