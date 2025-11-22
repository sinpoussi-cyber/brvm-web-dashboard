'use client';

import { useEffect, useState } from 'react';

interface FundamentalSummary {
  total_companies: number;
  buy_recommendations: number;
  sell_recommendations: number;
  hold_recommendations: number;
  avg_per?: number;
  avg_dividend_yield?: number;
  last_report_date?: string | null;
  top_performers: Array<{
    symbol: string;
    company_name: string;
    roe: number;
    per: number;
    dividend_yield: number;
    recommendation: string;
  }>;
}

export default function FundamentalSummary() {
  const [summary, setSummary] = useState<FundamentalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSummary();
  }, []);
  
  async function fetchSummary() {
    try {
      const response = await fetch('/api/fundamental-summary', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }
  
  if (loading || !summary) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Résumé Analyse Fondamentale
        </h2>
        {summary.last_report_date && (
          <div className="text-sm text-gray-500">
            Dernière mise à jour :{' '}
            {new Date(summary.last_report_date).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recommandations Achat</p>
              <p className="text-3xl font-bold text-green-700">
                {summary.buy_recommendations}
              </p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">À Conserver</p>
              <p className="text-3xl font-bold text-yellow-700">
                {summary.hold_recommendations}
              </p>
            </div>
            <div className="text-4xl">⏸️</div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recommandations Vente</p>
              <p className="text-3xl font-bold text-red-700">
                {summary.sell_recommendations}
              </p>
            </div>
            <div className="text-4xl">📉</div>
          </div>
        </div>
      </div>
      
      {summary.top_performers.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Top 5 Performers (ROE)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Symbole
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    ROE
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    PER
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Dividende
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Recommandation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.top_performers.map((performer) => (
                  <tr key={performer.symbol} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-bold">{performer.symbol}</td>
                    <td className="px-4 py-2 text-green-600 font-semibold">
                      {performer.roe?.toFixed(2)}%
                    </td>
                    <td className="px-4 py-2">{performer.per?.toFixed(2) || 'N/A'}</td>
                    <td className="px-4 py-2">
                      {performer.dividend_yield?.toFixed(2) || 'N/A'}%
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        performer.recommendation?.toLowerCase().includes('achat')
                          ? 'bg-green-100 text-green-800'
                          : performer.recommendation?.toLowerCase().includes('vente')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {performer.recommendation || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
