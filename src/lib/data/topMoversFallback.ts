import type { TopCompany } from '@/types/api';

import { getFallbackCompanies } from './companiesFallback';

const freeze = <T>(value: T): T => Object.freeze(value);

const asTopCompany = (company: TopCompany): TopCompany =>
  freeze({
    symbol: company.symbol,
    name: company.name,
    current_price: company.current_price,
    change: company.change,
    change_percent: company.change_percent,
    volume: company.volume,
  });

const buildTopMovers = (direction: 'gainers' | 'losers'): TopCompany[] => {
  const companies = getFallbackCompanies();

  const candidates = companies
    .filter(
      (company) =>
        typeof company.price_change_percent === 'number' &&
        typeof company.price_change === 'number' &&
        typeof company.current_price === 'number'
    )
    .map((company) => ({
      symbol: company.symbol,
      name: company.name,
      current_price: company.current_price as number,
      change: company.price_change as number,
      change_percent: company.price_change_percent as number,
      volume: typeof company.volume === 'number' ? company.volume : undefined,
    }));

  if (candidates.length === 0) {
    return [];
  }

  const sorted = candidates.sort((a, b) => {
    const first = a.change_percent ?? 0;
    const second = b.change_percent ?? 0;

    if (direction === 'gainers') {
      return second - first;
    }

    return first - second;
  });

  const slice = sorted.slice(0, 5).map(asTopCompany);

  return freeze(slice);
};

export const fallbackTopGainers: TopCompany[] = buildTopMovers('gainers');
export const fallbackTopLosers: TopCompany[] = buildTopMovers('losers');
