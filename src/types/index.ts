export type MarketOverview = {
  overview: {
    avg_change_percent: number;
    total_volume: number;
    total_companies: number;
  };
  top_sectors: { sector: string; total_volume: number }[];
};

export type TopMove = {
  symbol: string;
  latest_price: number;
  change_percent: number;
};

export type TopMovesResponse = {
  data: TopMove[];
};
// src/types/index.ts
export type IndexKey = 'composite' | 'brvm_30' | 'prestige' | 'croissance';

export interface TopMove {
  symbol: string;
  latest_price: number;
  change_percent: number;
}
