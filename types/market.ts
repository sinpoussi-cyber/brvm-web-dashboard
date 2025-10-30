export type TopMove = { symbol: string; latest_price: number; change_percent: number };
export type Overview = {
  avg_change_percent: number;
  total_volume: number;
  total_companies: number;
  total_value?: number;
  market_cap?: number;
};
export type IndexPoint = { date: string; value: number };
