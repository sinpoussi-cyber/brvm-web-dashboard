import MarketIndices from '@/components/MarketIndices';
import MarketStatistics from '@/components/MarketStatistics';
import FundamentalSummary from '@/components/FundamentalSummary';
import TechnicalSummary from '@/components/TechnicalSummary';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            BRVM Analysis Platform
          </h1>
          <p className="text-xl md:text-2xl text-blue-100">
            Plateforme d'analyse complète de la Bourse Régionale des Valeurs Mobilières
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Indices de Marché */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Indices de Marché en Temps Réel
          </h2>
          <MarketIndices />
        </section>
        
        {/* Statistiques du Marché */}
        <section>
          <MarketStatistics />
        </section>
        
        {/* Résumés d'Analyse */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <FundamentalSummary />
          </section>
          
          <section>
            <TechnicalSummary />
          </section>
        </div>
        
        {/* Actions Rapides */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Accès Rapide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/societes"
              className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border-2 border-blue-200 hover:border-blue-400"
            >
              <span className="text-4xl mb-3">🏢</span>
              <span className="font-semibold text-blue-900">Sociétés Cotées</span>
              <span className="text-xs text-blue-600 mt-1">Analyses détaillées</span>
            </Link>
            
            <Link
              href="/technique"
              className="flex flex-col items-center justify-center p-6 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border-2 border-purple-200 hover:border-purple-400"
            >
              <span className="text-4xl mb-3">📊</span>
              <span className="font-semibold text-purple-900">Analyse Technique</span>
              <span className="text-xs text-purple-600 mt-1">Indicateurs & Graphiques</span>
            </Link>
            
            <Link
              href="/recommandations"
              className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border-2 border-green-200 hover:border-green-400"
            >
              <span className="text-4xl mb-3">💡</span>
              <span className="font-semibold text-green-900">Recommandations</span>
              <span className="text-xs text-green-600 mt-1">Conseils d'investissement</span>
            </Link>
            
            <Link
              href="/training"
              className="flex flex-col items-center justify-center p-6 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border-2 border-orange-200 hover:border-orange-400"
            >
              <span className="text-4xl mb-3">🎮</span>
              <span className="font-semibold text-orange-900">Portefeuille Virtuel</span>
              <span className="text-xs text-orange-600 mt-1">S'entraîner sans risque</span>
            </Link>
          </div>
        </section>
        
        {/* Actualités/Événements */}
        <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Événements du Marché
          </h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Aujourd'hui</p>
              <p className="font-medium text-gray-900">
                Mise à jour quotidienne des données de marché
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Nouveauté</p>
              <p className="font-medium text-gray-900">
                Nouvelles recommandations IA disponibles
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
