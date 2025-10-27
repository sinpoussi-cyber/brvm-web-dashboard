import OverviewCards from "../components/dashboard/OverviewCards";
import TopMovers from "../components/dashboard/TopMovers";
import SectorsBar from "../components/charts/SectorsBar";
import { fetchData } from "../lib/api";

export default async function Page() {
  const overview = await fetchData("/overview");
  const gainers = await fetchData("/gainers/top");
  const losers = await fetchData("/losers/top");

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Tableau de bord BRVM</h1>
      <OverviewCards data={overview?.overview} />
      <div className="grid md:grid-cols-2 gap-6">
        <TopMovers title="Top Gagnants" data={gainers?.data} positive />
        <TopMovers title="Top Perdants" data={losers?.data} />
      </div>
      <SectorsBar data={overview?.top_sectors} />
    </main>
  );
}
