// ==============================================================================
// FORMATTERS - Fonctions utilitaires de formatage
// ==============================================================================

import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Format prix en F CFA
export const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return '-';
  return `${price.toLocaleString('fr-FR', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
  })} F`;
};

// Format nombre avec séparateurs
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString('fr-FR');
};

// Format pourcentage
export const formatPercent = (value: number | null | undefined, decimals = 2): string => {
  if (value === null || value === undefined) return '-';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

// Format date
export const formatDate = (date: string | Date, formatStr = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: fr });
  } catch {
    return '-';
  }
};

// Format date relative (il y a X jours)
export const formatRelativeDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { locale: fr, addSuffix: true });
  } catch {
    return '-';
  }
};

// Format volume
export const formatVolume = (volume: number | null | undefined): string => {
  if (volume === null || volume === undefined) return '-';
  
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
};

// Format capitalisation
export const formatMarketCap = (cap: number | null | undefined): string => {
  if (cap === null || cap === undefined) return '-';
  
  if (cap >= 1000000000) {
    return `${(cap / 1000000000).toFixed(2)}Mrd F`;
  } else if (cap >= 1000000) {
    return `${(cap / 1000000).toFixed(2)}M F`;
  }
  return formatPrice(cap);
};

// Tronquer texte
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Première lettre en majuscule
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Générer initiales
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Classe utilitaire pour fusionner classes Tailwind
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
