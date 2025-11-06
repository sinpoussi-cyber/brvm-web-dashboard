'use client';

import { useEffect, useState } from 'react';

interface Recommendation {
  id: string;
  symbol: string;
  recommendation: string;
  source: string;
  updated_at: string;
  companies: {
    name: string;
    sector: string;
  };
  category: 'buy' | 'sell' | 'hold';
}

interface RecommendationsData {
  top_buy: Recommendation[];
  top_sell: Recommendation[];
  all_recommendations: Recommendation[];
  last_update: string;
  summary: {
    total: number;
    buy_count: number;
    sell_count: number;
    hold_count: number;
  };
}

export default function RecommandationsPage() {
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'hold'>('all');
  
  useEffect(() => {
    fetchRecommendations();
  }, []);
  
  async function fetchRecommendations() {
    try {
      const response = await fetch('/api/recommendations');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">
              Impossible de charger les recommandations. Veuillez réessayer plus tard.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const filteredRecommendations = filter === 'all' 
    ? data.all_recommendations 
    : data.all_recommendations.filter(r => r.category === filter);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Recommandations d'Investissement
          </h1>
          <p className="text-gray-600">
            Recommandations générées par analyse IA des rapports quotidiens
          </p>
          {data.last_update && (
            <p className="text-sm text-gray-500 mt-2">
              Dernière mise à jour: {new Date(data.last_update).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500 mb-1">Total Actions</p>
            <p className="text-3xl font-bold text-gray-900">{data.summary.total}</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg shadow border-l-4 border-green-500">
            <p className="text-sm text-gray-500 mb-1">À Acheter</p>
            <p className="text-3xl font-bold text-green-600">{data.summary.buy_count}</p>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500 mb-1">À Conserver</p>
            <p className="text-3xl font-bold text-yellow-600">{data.summary.hold_count}</p>
          </div>
          
          <div className="bg-red-50 p-6 rounded-lg shadow border-l-4 border-red-500">
            <p className="text-sm text-gray-500 mb-1">À Vendre</p>
            <p className="text-3xl font-bold text-red-600">{data.summary.sell_count}</p>
          </div>
        </div>
        
        {/* Top 10 - Actions à Acheter */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-green-700">
              🔥 Top 10 - Actions à Acheter Immédiatement
            </h2>
          </div>
          
          {data.top_buy.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Aucune recommandation d'achat disponible pour le moment</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-50 to-green-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                      Rang
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                      Symbole
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                      Société
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                      Secteur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                      Recommandation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.top_buy.map((rec, index) => (
                    <tr key={rec.id} className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 font-bold text-lg">
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-900">{rec.symbol}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {rec.companies?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{rec.companies?.sector || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {rec.recommendation}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">{rec.source}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Top 10 - Actions à Vendre */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-red-700">
              ⚠️ Top 10 - Actions à Vendre ou Éviter
            </h2>
          </div>
          
          {data.top_sell.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Aucune recommandation de vente disponible pour le moment</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-red-50 to-red-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-red-800 uppercase tracking-wider">
                      Rang
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-red-800 uppercase tracking-wider">
                      Symbole
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-red-800 uppercase tracking-wider">
                      Société
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-red-800 uppercase tracking-wider">
                      Secteur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-red-800 uppercase tracking-wider">
                      Recommandation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-red-800 uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.top_sell.map((rec, index) => (
                    <tr key={rec.id} className="hover:bg-red-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-800 font-bold text-lg">
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-900">{rec.symbol}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {rec.companies?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{rec.companies?.sector || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {rec.recommendation}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">{rec.source}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Liste Complète */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Liste Complète des Recommandations</h2>
            
            {/* Filtres */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Toutes ({data.summary.total})
              </button>
              <button
                onClick={() => setFilter('buy')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'buy'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Acheter ({data.summary.buy_count})
              </button>
              <button
                onClick={() => setFilter('hold')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'hold'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Conserver ({data.summary.hold_count})
              </button>
              <button
                onClick={() => setFilter('sell')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'sell'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Vendre ({data.summary.sell_count})
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Symbole
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Société
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Secteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Recommandation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecommendations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-gray-900">{rec.symbol}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{rec.companies?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{rec.companies?.sector || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        rec.category === 'buy'
                          ? 'bg-green-100 text-green-800'
                          : rec.category === 'sell'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rec.recommendation}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">{rec.source}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRecommendations.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Aucune recommandation dans cette catégorie</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
