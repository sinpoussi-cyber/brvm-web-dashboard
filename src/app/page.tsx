import { api } from "@/lib/api";
import { KPI } from "@/components/KPI";
import { TopTable } from "@/components/TopTable";
import { SectorsBar } from "@/components/SectorsBar";

export const revalidate = 0;

async function loadAll() {
  const [overview, gainers, losers] = await Promise.all([
    api.getOverview(),
    api.getTopGainers(),
    api.getTopLosers(),
  ]);
  return { overview, gainers, losers };
}

export default async function Page() {
  try {
    const { overview, gainers, losers } = await loadAll();

    const avg = overview.overview.avg_change_percent ?? 0;
    const vol = overview.overview.total_volume ?? 0;
    const tot = overview.overview.total_companies ?? 0;

    return (
      <main className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPI label="Perf. moyenne" value={`${avg.toFixed(2)}%`} hint="Session en cours" />
          <KPI label="Volume total" value={vol.toLocaleString("fr-FR")} hint="Titres échangés" />
          <KPI label="Sociétés" value={tot} hint="Couvrant l'agrégat" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SectorsBar data={overview.top_sectors || []} />
          </div>
          <div className="space-y-4">
            <TopTable title="Top Gagnants" rows={gainers.data?.slice(0, 10) || []} />
            <TopTable title="Top Perdants" rows={losers.data?.slice(0, 10) || []} />
          </div>
        </div>
      </main>
    );
  } catch (err: any) {
    return (
      <main className="space-y-4">
        <div className="card">
          <div className="text-lg font-semibold mb-2">Erreur de connexion</div>
          <pre className="text-sm whitespace-pre-wrap text-red-700">
            {err?.message || "Erreur inconnue."}
          </pre>
        </div>
      </main>
    );
  }
}
