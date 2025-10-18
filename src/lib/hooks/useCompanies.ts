'use client';

import { useState, useCallback } from 'react';
import { getCompanies } from '../api/companies';
import type { CompanyDetail } from '@/types/api';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<CompanyDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCompanies();
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { companies, isLoading, error, fetchCompanies };
};
