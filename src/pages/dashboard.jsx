// src/pages/dashboard.jsx
import MarketOverview from "../components/MarketOverview";
import TopGainers from "../components/TopGainers";
import TopLosers from "../components/TopLosers";

export default function Dashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Tableau de bord BRVM</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <MarketOverview />
        </div>

        <div className="md:col-span-1">
          <TopGainers />
        </div>
        <div className="md:col-span-1">
          <TopLosers />
        </div>
      </div>
    </div>
  );
}
