export type Overview = {
  avg_change_percent: number;
  total_volume: number;
  total_companies: number;
};

export type Sector = {
  sector: string;
  total_volume: number;
};

export type GainerLoser = {
  symbol: string;
  latest_price: number;
  change_percent: number;
};
