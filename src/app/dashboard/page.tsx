import MarketOverview from '@/components/dashboard/MarketOverview';
import TopGainers from '@/components/dashboard/TopGainers';
import TopLosers from '@/components/dashboard/TopLosers';
import { AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble du marché BRVM</p>
        </div>

        {/* Alert API */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-yellow-800">
              ⚠️ Impossible de joindre l'API distante
            </p>
            <p className="text-yellow-700 mt-1">
              Les valeurs ci-dessous sont des exemples à titre indicatif. 
              Pour afficher les données réelles, rendez les endpoints de marché publics 
              dans votre backend API.
            </p>
          </div>
        </div>
        
        {/* Market Overview */}
        <MarketOverview />
        
        {/* Top Movers */}
        <div className="grid md:grid-cols-2 gap-6">
          <TopGainers />
          <TopLosers />
        </div>
      </div>
    </div>
  );
}
