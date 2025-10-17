// ==============================================================================
// TYPES PORTFOLIO - Types pour la gestion de portefeuille
// ==============================================================================

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: 'virtual' | 'real';
  initial_capital: number;
  current_value: number;
  cash_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioPerformance extends Portfolio {
  gain_loss: number;
  gain_loss_percent: number;
  holdings_count: number;
}

export interface Holding {
  id: string;
  portfolio_id: string;
  company_id: number;
  symbol: string;
  company_name: string;
  sector?: string;
  quantity: number;
  average_price: number;
  current_price: number;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  mm_decision?: string;
  rsi_decision?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  portfolio_id: string;
  company_id: number;
  symbol: string;
  company_name: string;
  transaction_type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total_amount: number;
  fees: number;
  net_amount: number;
  transaction_date: string;
  notes?: string;
}

export interface TransactionCreate {
  symbol: string;
  quantity: number;
  price?: number;
}
