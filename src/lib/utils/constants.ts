// ==============================================================================
// CONSTANTS - Constantes de l'application
// ==============================================================================

export const APP_NAME = 'BRVM Investment Platform';
export const APP_DESCRIPTION = 'Plateforme d\'investissement en bourse pour l\'UEMOA';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || '/api/v1';

// Secteurs de la BRVM
export const SECTORS = [
  'Banque',
  'Télécommunications',
  'Industrie',
  'Énergie',
  'Distribution',
  'Services',
] as const;

// Types d'utilisateurs
export const USER_TYPES = {
  RETAIL: 'retail',
  SGI: 'sgi',
  SGO: 'sgo',
  BRVM: 'brvm',
  ADMIN: 'admin',
} as const;

// Plans tarifaires
export const PRICING_PLANS = {
  FREE: {
    name: 'Gratuit',
    price: 0,
    portfolios: 1,
    alerts: 3,
    features: ['1 portefeuille virtuel', 'Données différées 15min', '3 alertes'],
  },
  PREMIUM: {
    name: 'Premium',
    price: 5000,
    portfolios: 5,
    alerts: 20,
    features: ['5 portefeuilles', 'Données temps réel', '20 alertes', 'Analyses IA'],
  },
  PRO: {
    name: 'Pro',
    price: 15000,
    portfolios: -1,
    alerts: -1,
    features: ['Portefeuilles illimités', 'Données temps réel', 'Alertes illimitées', 'Accès API'],
  },
} as const;

// Intervalles de temps pour les graphiques
export const TIME_RANGES = [
  { label: '7J', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1A', days: 365 },
  { label: 'Max', days: 1000 },
] as const;
