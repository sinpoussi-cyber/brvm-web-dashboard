import MarketOverview from "@/components/dashboard/MarketOverview";
import TopGainers from "@/components/dashboard/TopGainers";
import TopLosers from "@/components/dashboard/TopLosers";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <MarketOverview />
      <div className="grid md:grid-cols-2 gap-4">
        <TopGainers />
        <TopLosers />
      </div>
    </div>
  );
}
