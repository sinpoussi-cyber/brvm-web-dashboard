// ==============================================================================
// HOOK: usePortfolio - Gestion du portefeuille
// ==============================================================================

'use client';

import { useState, useEffect } from 'react';
import { getPortfolios, getHoldings, getPerformance } from '../api/portfolio';
import type { Portfolio, Holding, PortfolioPerformance } from '@/types/portfolio';

export const usePortfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const data = await getPortfolios();
      setPortfolios(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  return { portfolios, loading, error, refetch: fetchPortfolios };
};

export const useHoldings = (portfolioId: string | null) => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!portfolioId) return;
      
      try {
        setLoading(true);
        const data = await getHoldings(portfolioId);
        setHoldings(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, [portfolioId]);

  return { holdings, loading, error };
};

export const usePortfolioPerformance = (portfolioId: string | null) => {
  const [performance, setPerformance] = useState<PortfolioPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!portfolioId) return;
      
      try {
        setLoading(true);
        const data = await getPerformance(portfolioId);
        setPerformance(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [portfolioId]);

  return { performance, loading, error };
};
