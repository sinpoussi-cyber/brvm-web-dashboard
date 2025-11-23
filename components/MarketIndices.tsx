'use client';

import { useEffect, useState } from 'react';

interface MarketIndicators {
  brvm_composite: number | null;
  brvm_30: number | null;
  brvm_prestige: number | null;
  brvm_principal: number | null;
  variation_journaliere_brvm_composite: number | null;
  variation_ytd_brvm_composite: number | null;
  variation_journaliere_brvm_30: number | null;
  variation_ytd_brvm_30: number | null;
  variation_journaliere_brvm_prestige: number | null;
  variation_ytd_brvm_prestige: number | null;
  variation_journaliere_brvm_principal: number | null;
  variation_ytd_brvm_principal: number | null;
  extraction_date: string | null;
}

export default function MarketIndices() {
  const [indicators, setIndicators] = useState<MarketIndicators | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchIndicators();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchIndicators, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  async function fetchIndicators() {
    try {
      const response = await fetch('/api/market-indicators', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des indicateurs');
      }
      const raw = await response.json();
      const normalize = (value: any, fallback?: any) => {
        const parsed = Number(value ?? fallback);
        return Number.isFinite(parsed) ? parsed : null;
      };
      const formatted: MarketIndicators = {
        brvm_composite: normalize(raw.brvm_composite),
        brvm_30: normalize(raw.brvm_30),
        brvm_prestige: normalize(raw.brvm_prestige),
        brvm_principal: normalize(raw.brvm_principal, raw.brvm_croissance),
        variation_journaliere_brvm_composite: normalize(raw.variation_journaliere_brvm_composite),
        variation_ytd_brvm_composite: normalize(raw.variation_ytd_brvm_composite),
        variation_journaliere_brvm_30: normalize(raw.variation_journaliere_brvm_30),
        variation_ytd_brvm_30: normalize(raw.variation_ytd_brvm_30),
        variation_journaliere_brvm_prestige: normalize(raw.variation_journaliere_brvm_prestige),
        variation_ytd_brvm_prestige: normalize(raw.variation_ytd_brvm_prestige),
        variation_journaliere_brvm_principal: normalize(
          raw.variation_journaliere_brvm_principal,
          raw.variation_journaliere_brvm_croissance,
        ),
        variation_ytd_brvm_principal: normalize(
          raw.variation_ytd_brvm_principal,
          raw.variation_ytd_brvm_croissance,
        ),
        extraction_date: raw.extraction_date ?? null,
      };
      setIndicators(formatted);
      setError(null);
    } catch (err) {
      console.error('Erreur chargement indicateurs:', err);
      setError('Impossible de charger les indicateurs de marché');
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-medium">Erreur</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  if (!indicators) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        Aucun indicateur disponible
      </div>
    );
  }
  
  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  };
  
  const formatVariation = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    const formatted = Math.abs(num).toFixed(2);
    return num >= 0 ? `+${formatted}%` : `-${formatted}%`;
  };
  
  const indices = [
    {
      name: 'BRVM COMPOSITE',
      value: indicators.brvm_composite,
      variation: indicators.variation_journaliere_brvm_composite,
      ytd: indicators.variation_ytd_brvm_composite,
      borderClass: 'border-blue-500',
    },
    {
      name: 'BRVM 30',
      value: indicators.brvm_30,
      variation: indicators.variation_journaliere_brvm_30,
      ytd: indicators.variation_ytd_brvm_30,
      borderClass: 'border-indigo-500',
    },
    {
      name: 'BRVM PRESTIGE',
      value: indicators.brvm_prestige,
      variation: indicators.variation_journaliere_brvm_prestige,
      ytd: indicators.variation_ytd_brvm_prestige,
      borderClass: 'border-purple-500',
    },
    {
      name: 'BRVM PRINCIPAL',
      value: indicators.brvm_principal,
      variation: indicators.variation_journaliere_brvm_principal,
      ytd: indicators.variation_ytd_brvm_principal,
      borderClass: 'border-emerald-500',
    },
  ];

  const getTrendColor = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'text-gray-500';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTrendSymbol = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '•';
    return value >= 0 ? '↑' : '↓';
  };
  
  return (
    <div className="space-y-2">
      {indicators.extraction_date && (
        <div className="text-right text-xs text-gray-500">
          Dernière mise à jour : {new Date(indicators.extraction_date).toLocaleString('fr-FR')}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indices.map((index) => (
          <div
            key={index.name}
            className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 ${index.borderClass}`}
          >
            <h3 className="text-sm font-medium text-gray-500 mb-2">{index.name}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-3">
              {formatNumber(index.value)}
            </p>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Var. Jour:</span>
                <span className={`text-sm font-semibold ${getTrendColor(index.variation)}`}>
                  {getTrendSymbol(index.variation)} {formatVariation(index.variation)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">YTD:</span>
                <span className={`text-sm font-semibold ${getTrendColor(index.ytd)}`}>
                  {formatVariation(index.ytd)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
