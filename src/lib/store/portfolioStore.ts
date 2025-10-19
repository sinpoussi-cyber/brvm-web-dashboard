'use client';

import { create } from 'zustand';

interface PortfolioState {
  portfolios: any[];
  isLoading: boolean;
}

export const usePortfolioStore = create<PortfolioState>(() => ({
  portfolios: [],
  isLoading: false,
}));
