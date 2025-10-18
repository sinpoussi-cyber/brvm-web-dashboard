import MarketOverview from '@/components/dashboard/MarketOverview';
import TopGainers from '@/components/dashboard/TopGainers';
import TopLosers from '@/components/dashboard/TopLosers';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble du marché BRVM</p>
        </div>
        
        <MarketOverview />
        
        <div className="grid md:grid-cols-2 gap-6">
          <TopGainers />
          <TopLosers />
        </div>
      </div>
    </div>
  );
}
