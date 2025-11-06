'use client';

import { useEffect, useState } from 'react';

interface MarketStats {
  extraction_date: string;
  formatted_date: string;
  capitalisation_globale: number;
  volume_moyen_annuel: number;
  valeur_moyenne_annuelle: number;
  variation_journaliere_capitalisation_globale: number;
  variation_ytd_capitalisation_globale: number;
}

export default function MarketStatistics() {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStats();
    // Actualiser toutes les heures
    const interval = setInterval(fetchStats, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  async function fetchStats() {
    try {
      const response = await fetch('/api/market-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    } finally {
      setLoading(false);
    }
  }
  
  if (loading || !stats) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const formatBillions = (value: number) => {
    return (value / 1e9).toFixed(2);
  };
  
  const formatMillions = (value: number) => {
    return (value / 1e6).toFixed(2);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Statistiques du Marché</h2>
        <div className="text-right">
          <p className="text-xs text-gray-500">Mise à jour</p>
          <p className="text-sm font-medium text-gray-700">{stats.formatted_date}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Capitalisation Globale</p>
            <span className={`text-xs px-2 py-1 rounded ${
              stats.variation_journaliere_capitalisation_globale >= 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {stats.variation_journaliere_capitalisation_globale >= 0 ? '+' : ''}
              {stats.variation_journaliere_capitalisation_globale?.toFixed(2)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatBillions(stats.capitalisation_globale)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Milliards FCFA</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-600 mb-2">Volume Moyen Annuel</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatMillions(stats.volume_moyen_annuel)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Millions d'actions</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-600 mb-2">Valeur Moyenne Annuelle</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatBillions(stats.valeur_moyenne_annuelle)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Milliards FCFA</p>
        </div>
      </div>
    </div>
  );
}
