// ==============================================================================
// VALIDATORS - Schémas de validation avec Zod
// ==============================================================================

import { z } from 'zod';

// Validation inscription
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().optional(),
  user_type: z.enum(['retail', 'sgi', 'sgo', 'brvm']).default('retail'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Validation connexion
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Validation création portefeuille
export const portfolioSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  type: z.enum(['virtual', 'real']).default('virtual'),
  initial_capital: z.number().positive('Le capital doit être positif'),
});

export type PortfolioFormData = z.infer<typeof portfolioSchema>;

// Validation transaction
export const transactionSchema = z.object({
  symbol: z.string().min(1, 'Le symbole est requis'),
  quantity: z.number().int().positive('La quantité doit être positive'),
  price: z.number().positive('Le prix doit être positif').optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

// Validation alerte
export const alertSchema = z.object({
  symbol: z.string().min(1, 'Le symbole est requis'),
  alert_type: z.enum(['price_above', 'price_below', 'signal_buy', 'signal_sell']),
  threshold_value: z.number().positive().optional(),
});

export type AlertFormData = z.infer<typeof alertSchema>;

// Validation watchlist
export const watchlistSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().optional(),
});

export type WatchlistFormData = z.infer<typeof watchlistSchema>;

// Validation profil utilisateur
export const profileSchema = z.object({
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'La bio ne peut pas dépasser 500 caractères').optional(),
  location: z.string().optional(),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Validation préférences
export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark']),
  language: z.enum(['fr', 'en']),
  notifications_enabled: z.boolean(),
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  push_notifications: z.boolean(),
  default_currency: z.string().default('XOF'),
  favorite_sectors: z.array(z.string()),
  watchlist_view: z.enum(['grid', 'list']),
  chart_type: z.enum(['candlestick', 'line', 'area']),
});

export type PreferencesFormData = z.infer<typeof preferencesSchema>;
