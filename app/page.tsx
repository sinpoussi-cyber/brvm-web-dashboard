import MarketIndices from '@/components/MarketIndices';
import MarketStatistics from '@/components/MarketStatistics';
import FundamentalSummary from '@/components/FundamentalSummary';
import TechnicalSummary from '@/components/TechnicalSummary';
import MarketEvents from '@/components/MarketEvents';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white py-12">
        <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
        <div className="relative container mx-auto px-4">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-100/90 font-semibold mb-2 drop-shadow">
            Synchronisé chaque jour à 04h (heure locale)
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)]">
            BRVM Analysis Platform
          </h1>
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]">
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
