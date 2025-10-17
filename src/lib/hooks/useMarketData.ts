// ==============================================================================
// HOOK: useMarketData - Données de marché
// ==============================================================================

'use client';

import { useState, useEffect } from 'react';
import {
  getPriceHistory,
  getQuote,
  getTopGainers,
  getTopLosers,
  getSectorPerformance,
} from '../api/market';
import type { PriceData, Quote, TopCompany, SectorPerformanceResponse } from '@/types/api';

export const usePriceHistory = (symbol: string, days = 100) => {
  const [data, setData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) return;
      
      try {
        setLoading(true);
        const result = await getPriceHistory(symbol, days);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, days]);

  return { data, loading, error };
};

export const useQuote = (symbol: string) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!symbol) return;
      
      try {
        setLoading(true);
        const result = await getQuote(symbol);
        setQuote(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [symbol]);

  return { quote, loading, error };
};

export const useTopMovers = () => {
  const [gainers, setGainers] = useState<TopCompany[]>([]);
  const [losers, setLosers] = useState<TopCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [gainersData, losersData] = await Promise.all([
          getTopGainers(5),
          getTopLosers(5),
        ]);
        setGainers(gainersData);
        setLosers(losersData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { gainers, losers, loading, error };
};

export const useSectorPerformance = (period = 30) => {
  const [data, setData] = useState<SectorPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getSectorPerformance(period);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  return { data, loading, error };
};
