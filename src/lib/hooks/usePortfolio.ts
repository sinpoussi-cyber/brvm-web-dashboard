'use client';

import { useState, useEffect } from 'react';
import { getPortfolios } from '../api/portfolio';
import type { Portfolio } from '@/types/portfolio';

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
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  return { portfolios, loading, error, refetch: fetchPortfolios };
};
