'use client';

import { useEffect, useState } from 'react';

interface TechnicalSummaryData {
  bullish_signals: number;
  bearish_signals: number;
  neutral_signals: number;
  overbought: number;
  oversold: number;
  positive_macd: number;
  negative_macd: number;
  last_update: string;
}

type TechnicalSummaryProps = {
  data?: TechnicalSummaryData | null;
};

export default function TechnicalSummary({ data }: TechnicalSummaryProps) {
  const [summary, setSummary] = useState<TechnicalSummaryData | null>(data ?? null);
  const [loading, setLoading] = useState(!data);
  
  useEffect(() => {
    if (data) {
      setSummary(data);
      setLoading(false);
      return;
    }
    
    fetchSummary();
  }, [data]);
  
  async function fetchSummary() {
    if (data) return;
    try {
      const response = await fetch('/api/technical-summary', {
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
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const total = summary.bullish_signals + summary.bearish_signals + summary.neutral_signals;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Résumé Analyse Technique
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Signaux Haussiers</p>
            <span className="text-2xl">🔼</span>
          </div>
          <p className="text-3xl font-bold text-green-700">
            {summary.bullish_signals}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {total > 0 ? ((summary.bullish_signals / total) * 100).toFixed(1) : 0}% du marché
          </p>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Signaux Neutres</p>
            <span className="text-2xl">⏺️</span>
          </div>
          <p className="text-3xl font-bold text-gray-700">
            {summary.neutral_signals}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {total > 0 ? ((summary.neutral_signals / total) * 100).toFixed(1) : 0}% du marché
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Signaux Baissiers</p>
            <span className="text-2xl">🔽</span>
          </div>
          <p className="text-3xl font-bold text-red-700">
            {summary.bearish_signals}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {total > 0 ? ((summary.bearish_signals / total) * 100).toFixed(1) : 0}% du marché
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-red-50 to-green-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">RSI</p>
          <div className="flex justify-between items-center mb-2">
            <div className="text-center">
              <p className="text-xs text-gray-500">Survendu (&lt;30)</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.oversold}
              </p>
              <p className="text-xs text-gray-400">Opportunités</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Suracheté (&gt;70)</p>
              <p className="text-2xl font-bold text-red-600">
                {summary.overbought}
              </p>
              <p className="text-xs text-gray-400">Prudence</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">MACD</p>
          <div className="flex justify-between items-center mb-2">
            <div className="text-center">
              <p className="text-xs text-gray-500">Positif</p>
              <p className="text-2xl font-bold text-blue-600">
                {summary.positive_macd}
              </p>
              <p className="text-xs text-gray-400">Momentum +</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Négatif</p>
              <p className="text-2xl font-bold text-red-600">
                {summary.negative_macd}
              </p>
              <p className="text-xs text-gray-400">Momentum -</p>
            </div>
          </div>
        </div>
      </div>
      
      {summary.last_update && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          Dernière mise à jour: {new Date(summary.last_update).toLocaleDateString('fr-FR')}
        </p>
      )}
    </div>
  );
}
