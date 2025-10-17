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
    portfolios: -1, // Illimité
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

// Types de graphiques
export const CHART_TYPES = {
  LINE: 'line',
  AREA: 'area',
  CANDLESTICK: 'candlestick',
  BAR: 'bar',
} as const;

// Signaux de trading
export const SIGNAL_TYPES = {
  BUY: 'Achat',
  SELL: 'Vente',
  NEUTRAL: 'Neutre',
  STRONG_BUY: 'Achat (Fort)',
  STRONG_SELL: 'Vente (Fort)',
} as const;

// Couleurs des signaux
export const SIGNAL_COLORS = {
  'Achat': 'text-green-600',
  'Vente': 'text-red-600',
  'Neutre': 'text-gray-600',
  'Achat (Fort)': 'text-green-700',
  'Vente (Fort)': 'text-red-700',
  'Attendre': 'text-yellow-600',
} as const;

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  COMPANIES: '/companies',
  PORTFOLIO: '/portfolio',
  WATCHLIST: '/watchlist',
  SCREENER: '/screener',
  SETTINGS: '/settings',
} as const;

// Limites de pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Durées de cache (en millisecondes)
export const CACHE_DURATION = {
  MARKET_DATA: 5 * 60 * 1000, // 5 minutes
  COMPANIES: 60 * 60 * 1000, // 1 heure
  USER_PROFILE: 30 * 60 * 1000, // 30 minutes
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  AUTH_REQUIRED: 'Veuillez vous connecter',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  GENERIC_ERROR: 'Une erreur est survenue',
} as const;

// Regex de validation
export const VALIDATION_REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+225|0)[0-9]{10}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
} as const;
