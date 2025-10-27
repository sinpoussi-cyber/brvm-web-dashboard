import OverviewCards from "../components/dashboard/OverviewCards";
import TopMovers from "../components/dashboard/TopMovers";
import SectorsBar from "../components/charts/SectorsBar";
import { api } from "../lib/api";

export default async function Page() {
  const [overviewRes, gainersRes, losersRes] = await Promise.all([
    api.overview(),
    api.gainers(),
    api.losers()
  ]);

  const overview = overviewRes?.overview ?? {
    avg_change_percent: 0,
    total_volume: 0,
    total_companies: 0
  };
  const sectors = overviewRes?.top_sectors ?? [];
  const gainers = gainersRes?.data ?? [];
  const losers = losersRes?.data ?? [];

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Tableau de bord BRVM</h1>
        <p className="text-slate-500">Vue d’ensemble du marché</p>
      </header>

      <OverviewCards data={overview} />

      <section className="grid md:grid-cols-2 gap-6">
        <TopMovers title="Top Gagnants" data={gainers} positive />
        <TopMovers title="Top Perdants" data={losers} />
      </section>

      <SectorsBar data={sectors} />
    </main>
  );
}
