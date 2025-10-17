// ==============================================================================
// HOOK: useCompanies - Gestion des sociétés
// ==============================================================================

'use client';

import { useState, useEffect } from 'react';
import { getCompanies, getCompany, getSectors } from '../api/companies';
import type { CompanyDetail, Sector } from '@/types/api';

export const useCompanies = (filters?: { sector?: string; search?: string }) => {
  const [companies, setCompanies] = useState<CompanyDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await getCompanies(filters);
        setCompanies(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [filters?.sector, filters?.search]);

  return { companies, loading, error };
};

export const useCompany = (symbol: string) => {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const data = await getCompany(symbol);
        setCompany(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchCompany();
    }
  }, [symbol]);

  return { company, loading, error };
};

export const useSectors = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoading(true);
        const data = await getSectors();
        setSectors(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  return { sectors, loading, error };
};
