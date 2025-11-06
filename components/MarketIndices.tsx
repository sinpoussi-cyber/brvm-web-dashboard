'use client';

import { useEffect, useState } from 'react';

interface MarketIndicators {
  brvm_composite: number;
  brvm_30: number;
  brvm_prestige: number;
  brvm_croissance: number;
  variation_journaliere_brvm_composite: number;
  variation_ytd_brvm_composite: number;
  variation_journaliere_brvm_30: number;
  variation_ytd_brvm_30: number;
  variation_journaliere_brvm_prestige: number;
  variation_ytd_brvm_prestige: number;
  variation_journaliere_brvm_croissance: number;
  variation_ytd_brvm_croissance: number;
  extraction_date: string;
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
      const response = await fetch('/api/market-indicators');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des indicateurs');
      }
      const data = await response.json();
      setIndicators(data);
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
    return num.toFixed(2);
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
      color: 'blue'
    },
    {
      name: 'BRVM 30',
      value: indicators.brvm_30,
      variation: indicators.variation_journaliere_brvm_30,
      ytd: indicators.variation_ytd_brvm_30,
      color: 'indigo'
    },
    {
      name: 'BRVM PRESTIGE',
      value: indicators.brvm_prestige,
      variation: indicators.variation_journaliere_brvm_prestige,
      ytd: indicators.variation_ytd_brvm_prestige,
      color: 'purple'
    },
    {
      name: 'BRVM CROISSANCE',
      value: indicators.brvm_croissance,
      variation: indicators.variation_journaliere_brvm_croissance,
      ytd: indicators.variation_ytd_brvm_croissance,
      color: 'pink'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {indices.map((index) => (
        <div key={index.name} className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-${index.color}-500`}>
          <h3 className="text-sm font-medium text-gray-500 mb-2">{index.name}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-3">
            {formatNumber(index.value)}
          </p>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Var. Jour:</span>
              <span className={`text-sm font-semibold ${
                (index.variation || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(index.variation || 0) >= 0 ? '↑' : '↓'} {formatVariation(index.variation)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">YTD:</span>
              <span className={`text-sm font-semibold ${
                (index.ytd || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatVariation(index.ytd)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
