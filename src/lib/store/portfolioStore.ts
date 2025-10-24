'use client';

import { create } from 'zustand';
import type { Portfolio } from '@/types/portfolio';

interface PortfolioState {
  portfolios: Portfolio[];
  isLoading: boolean;
  setPortfolios: (portfolios: Portfolio[]) => void;
  setLoading: (loading: boolean) => void;
  addPortfolio: (portfolio: Portfolio) => void;
  removePortfolio: (id: string) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: [],
  isLoading: false,
  setPortfolios: (portfolios) => set({ portfolios }),
  setLoading: (isLoading) => set({ isLoading }),
  addPortfolio: (portfolio) => set((state) => ({
    portfolios: [...state.portfolios, portfolio]
  })),
  removePortfolio: (id) => set((state) => ({
    portfolios: state.portfolios.filter((p) => p.id !== id)
  })),
}));
