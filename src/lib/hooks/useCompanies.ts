'use client';

import { useState, useCallback } from 'react';
import { getCompanies } from '../api/companies';
import type { CompanyDetail } from '@/types/api';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<CompanyDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch
