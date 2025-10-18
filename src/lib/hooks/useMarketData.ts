'use client';

import { useState, useEffect } from 'react';
import { getTopGainers, getTopLosers } from '../api/market';
import type { TopCompany } from '@/types/api';

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
        setError(err instanceof Error ? err.message : 'Erreur');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { gainers, losers, loading, error };
};
