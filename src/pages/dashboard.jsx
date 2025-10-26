import MarketOverview from "../components/MarketOverview";
import TopGainers from "../components/TopGainers";
import TopLosers from "../components/TopLosers";

export default function Dashboard() {
  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Tableau de bord BRVM
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <MarketOverview />
        </div>
        <TopGainers />
        <TopLosers />
      </div>
    </main>
  );
}
