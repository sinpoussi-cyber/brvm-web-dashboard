// ==============================================================================
// API PORTFOLIO - Gestion des portefeuilles
// ==============================================================================

import apiClient, { handleApiError } from './client';
import type { Portfolio, PortfolioPerformance, Holding, Transaction, TransactionCreate } from '@/types/portfolio';

// Récupérer mes portefeuilles
export const getPortfolios = async (): Promise<Portfolio[]> => {
  try {
    const response = await apiClient.get<Portfolio[]>('/portfolios/');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Créer un portefeuille
export const createPortfolio = async (data: {
  name: string;
  description?: string;
  type: string;
  initial_capital: number;
}): Promise<Portfolio> => {
  try {
    const response = await apiClient.post<Portfolio>('/portfolios/', data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Acheter des actions
export const buyStock = async (
  portfolioId: string,
  transaction: TransactionCreate
): Promise<Transaction> => {
  try {
    const response = await apiClient.post<Transaction>(
      `/portfolios/${portfolioId}/buy`,
      transaction
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Récupérer les positions
export const getHoldings = async (portfolioId: string): Promise<Holding[]> => {
  try {
    const response = await apiClient.get<Holding[]>(
      `/portfolios/${portfolioId}/holdings`
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Récupérer la performance
export const getPerformance = async (
  portfolioId: string
): Promise<PortfolioPerformance> => {
  try {
    const response = await apiClient.get<PortfolioPerformance>(
      `/portfolios/${portfolioId}/performance`
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
