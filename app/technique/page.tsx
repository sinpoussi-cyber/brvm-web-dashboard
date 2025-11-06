'use client';

import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TechnicalAnalysis {
  symbol: string;
  current_price: number;
  ma20: number;
  ma50: number;
  rsi: number;
  macd: number;
  signal: number;
  histogram: number;
  trend: string;
  trade_date: string;
  rsi_signal: string;
  macd_signal: string;
  ma_signal: string;
  overall_sentiment: string;
}

interface MarketSummary {
  bullish_signals: number;
  bearish_signals: number;
  neutral_signals: number;
  overbought: number;
  oversold: number;
  positive_macd: number;
  negative_macd: number;
  total_stocks: number;
}

export default function TechniquePage() {
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [analysis, setAnalysis] = useState<TechnicalAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [companies, setCompanies] = useState<Array<{symbol: string, name: string}>>([]);
  
  useEffect(() => {
    fetchMarketSummary();
    fetchCompanies();
  }, []);
  
  async function fetchMarketSummary() {
    try {
      const response = await fetch('/api/technical-market-summary');
      const data = await response.json();
      setMarketSummary(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  }
  
  async function fetchCompanies() {
    try {
      const response = await fetch('/api/companies/list');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Erreur:', error);
      // Liste de secours
      setCompanies([
        { symbol: 'TTRC', name: 'Total Côte d\'Ivoire' },
        { symbol: 'SNTS', name: 'Sonatel' },
        { symbol: 'SGBC', name: 'SGBCI' },
        { symbol: 'BOAC', name: 'BOA Côte d\'Ivoire' },
        { symbol: 'SIVC', name: 'SIVOM' }
      ]);
    }
  }
  
  async function handleValidate() {
    if (!selectedSymbol) {
      alert('Veuillez sélectionner une société');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/companies/${selectedSymbol}/technical-analysis`);
      
      if (!response.ok) {
        throw new Error('Données non disponibles');
      }
      
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement de l\'analyse technique');
    } finally {
      setLoading(false);
    }
  }
  
  const getSentimentColor = (sentiment: string) => {
    if (sentiment.includes('Haussier')) return 'text-green-600 bg-green-50 border-green-200';
    if (sentiment.includes('Baissier')) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Analyse Technique</h1>
        
        {/* Résumé du Marché */}
        {marketSummary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Résumé Global du Marché
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow border-l-4 border-green-500">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Signaux Haussiers</h3>
                <p className="text-4xl font-bold text-green-600">
                  {marketSummary.bullish_signals}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {marketSummary.total_stocks > 0 
                    ? ((marketSummary.bullish_signals / marketSummary.total_stocks) * 100).toFixed(1)
                    : 0}% du marché
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg shadow border-l-4 border-gray-500">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Signaux Neutres</h3>
                <p className="text-4xl font-bold text-gray-600">
                  {marketSummary.neutral_signals}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {marketSummary.total_stocks > 0 
                    ? ((marketSummary.neutral_signals / marketSummary.total_stocks) * 100).toFixed(1)
                    : 0}% du marché
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow border-l-4 border-red-500">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Signaux Baissiers</h3>
                <p className="text-4xl font-bold text-red-600">
                  {marketSummary.bearish_signals}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {marketSummary.total_stocks > 0 
                    ? ((marketSummary.bearish_signals / marketSummary.total_stocks) * 100).toFixed(1)
                    : 0}% du marché
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Actions</h3>
                <p className="text-4xl font-bold text-blue-600">
                  {marketSummary.total_stocks}
                </p>
                <p className="text-sm text-gray-600 mt-2">Sociétés analysées</p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500 mb-3">RSI</h4>
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{marketSummary.oversold}</p>
                    <p className="text-xs text-gray-500">Survendus (Opportunités)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{marketSummary.overbought}</p>
                    <p className="text-xs text-gray-500">Surachetés (Prudence)</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500 mb-3">MACD</h4>
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{marketSummary.positive_macd}</p>
                    <p className="text-xs text-gray-500">Momentum Positif</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{marketSummary.negative_macd}</p>
                    <p className="text-xs text-gray-500">Momentum Négatif</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Sélection de société */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Analyse d'une Société Spécifique
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner une société
              </label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Choisir une société --</option>
                {companies.map((company) => (
                  <option key={company.symbol} value={company.symbol}>
                    {company.symbol} - {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleValidate}
                disabled={loading || !selectedSymbol}
                className="px-8 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Chargement...' : 'Analyser'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Résultats de l'analyse */}
        {analysis && (
          <div className="space-y-6">
            {/* Sentiment Global */}
            <div className={`p-6 rounded-lg border-2 ${getSentimentColor(analysis.overall_sentiment)}`}>
              <h2 className="text-xl font-bold mb-2">Sentiment Global</h2>
              <p className="text-3xl font-bold">{analysis.overall_sentiment}</p>
              <p className="text-sm mt-2">
                Basé sur RSI, MACD et Moyennes Mobiles
              </p>
            </div>
            
            {/* Indicateurs principaux */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Prix Actuel</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analysis.current_price?.toFixed(0)} <span className="text-sm">FCFA</span>
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">RSI</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analysis.rsi?.toFixed(2)}</p>
                <p className={`text-sm mt-1 font-medium ${
                  analysis.rsi_signal === 'Suracheté' ? 'text-red-600' :
                  analysis.rsi_signal === 'Survendu' ? 'text-green-600' :
                  'text-gray-600'
                }`}>
                  {analysis.rsi_signal}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">MACD</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analysis.macd?.toFixed(4)}</p>
                <p className={`text-sm mt-1 font-medium ${
                  analysis.macd_signal === 'Haussier' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analysis.macd_signal}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Tendance</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{analysis.trend || 'N/A'}</p>
                <p className="text-sm mt-1 text-gray-600">
                  {analysis.trade_date ? new Date(analysis.trade_date).toLocaleDateString('fr-FR') : ''}
                </p>
              </div>
            </div>
            
            {/* Graphique RSI */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Indicateur RSI</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: ['RSI Actuel'],
                    datasets: [{
                      label: 'RSI',
                      data: [analysis.rsi],
                      backgroundColor: analysis.rsi > 70 ? 'rgba(239, 68, 68, 0.6)' :
                                       analysis.rsi < 30 ? 'rgba(34, 197, 94, 0.6)' :
                                       'rgba(59, 130, 246, 0.6)',
                      borderColor: analysis.rsi > 70 ? 'rgb(239, 68, 68)' :
                                   analysis.rsi < 30 ? 'rgb(34, 197, 94)' :
                                   'rgb(59, 130, 246)',
                      borderWidth: 2
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        min: 0,
                        max: 100,
                        ticks: {
                          callback: function(value) {
                            if (value === 70) return '70 (Suracheté)';
                            if (value === 30) return '30 (Survendu)';
                            if (value === 50) return '50 (Neutre)';
                            return value;
                          }
                        },
                        grid: {
                          color: function(context) {
                            if (context.tick.value === 70 || context.tick.value === 30) {
                              return 'rgba(0, 0, 0, 0.3)';
                            }
                            return 'rgba(0, 0, 0, 0.05)';
                          },
                          lineWidth: function(context) {
                            if (context.tick.value === 70 || context.tick.value === 30) {
                              return 2;
                            }
                            return 1;
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-4 flex justify-around text-sm">
                <div className="text-center">
                  <div className="w-16 h-2 bg-red-500 mx-auto mb-1"></div>
                  <p className="text-gray-600">Suracheté (&gt;70)</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-2 bg-blue-500 mx-auto mb-1"></div>
                  <p className="text-gray-600">Neutre (30-70)</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-2 bg-green-500 mx-auto mb-1"></div>
                  <p className="text-gray-600">Survendu (&lt;30)</p>
                </div>
              </div>
            </div>
            
            {/* Graphique MACD */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Indicateur MACD</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: ['MACD', 'Signal', 'Histogramme'],
                    datasets: [{
                      label: 'Valeurs',
                      data: [analysis.macd, analysis.signal, analysis.histogram],
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.6)',
                        'rgba(239, 68, 68, 0.6)',
                        (analysis.histogram || 0) > 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'
                      ],
                      borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(239, 68, 68)',
                        (analysis.histogram || 0) > 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                      ],
                      borderWidth: 2
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-4 bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">
                  <strong>Interprétation:</strong> Lorsque MACD est au-dessus de la ligne de signal 
                  (histogramme positif), c'est un signal haussier. Inversement, c'est un signal baissier.
                </p>
              </div>
            </div>
            
            {/* Moyennes Mobiles */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Moyennes Mobiles</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Prix actuel:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {analysis.current_price?.toFixed(0)} FCFA
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">MA20 (20 jours):</span>
                  <span className={`text-xl font-bold ${
                    (analysis.current_price || 0) > (analysis.ma20 || 0) ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analysis.ma20?.toFixed(0)} FCFA
                    {(analysis.current_price || 0) > (analysis.ma20 || 0) ? ' ↑' : ' ↓'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">MA50 (50 jours):</span>
                  <span className={`text-xl font-bold ${
                    (analysis.current_price || 0) > (analysis.ma50 || 0) ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analysis.ma50?.toFixed(0)} FCFA
                    {(analysis.current_price || 0) > (analysis.ma50 || 0) ? ' ↑' : ' ↓'}
                  </span>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="font-medium text-blue-900 mb-1">Signal:</p>
                  <p className="text-lg font-bold text-blue-700">{analysis.ma_signal}</p>
                  <p className="text-sm text-blue-600 mt-2">
                    {(analysis.current_price || 0) > (analysis.ma20 || 0) && (analysis.ma20 || 0) > (analysis.ma50 || 0)
                      ? 'Configuration haussière classique : Prix > MA20 > MA50'
                      : (analysis.current_price || 0) < (analysis.ma20 || 0) && (analysis.ma20 || 0) < (analysis.ma50 || 0)
                      ? 'Configuration baissière classique : Prix < MA20 < MA50'
                      : 'Configuration mixte ou en transition'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
