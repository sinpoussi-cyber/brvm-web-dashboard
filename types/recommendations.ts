export type RecommendationDocAction = 'buy' | 'sell' | 'avoid' | 'watch';

export type RecommendationRecord = {
  symbol: string;
  company_name?: string;
  sector?: string;
  recommendation?: string;
  overall_signal?: string;
  last_close?: number;
  variation_pred?: number;
  rsi?: number;
  macd?: number;
  doc_action?: RecommendationDocAction;
  doc_comment?: string;
  doc_rank?: number;
};

export type RecommendationMetadata = {
  fetched_at: string;
  source?: string;
  doc_title?: string;
  doc_updated_at?: string;
  buy_count: number;
  sell_count: number;
};

export type RecommendationPayload = {
  items: RecommendationRecord[];
  metadata: RecommendationMetadata;
};
