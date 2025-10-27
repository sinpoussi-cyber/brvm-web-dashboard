import { api } from "@/lib/api";
import { KPI } from "@/components/KPI";
import { TopTable } from "@/components/TopTable";
import { SectorsBar } from "@/components/SectorsBar";

export const revalidate = 0; // pas de cache ISR pour avoir les valeurs live

async function loadAll() {
  // On lance les 3 appels en parallèle pour aller plus vite
  const [overview, gainers, losers] = await Promise.all([
    api.getOverview().catch((e) => { throw new Error(`[overview] ${e.message}`); }),
    api.getTopGainers().catch((e) => { throw new Error(`[gainers/top] ${e.message}`); }),
    api.getTopLosers().catch((e) => { throw new Error(`[losers/top] ${e.message}`); }),
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
    // Message d'erreur clair (inclut le tag [route] grâce à loadAll())
    return (
      <main className="space-y-4">
        <div className="card">
          <div className="text-lg font-semibold mb-2">Erreur de connexion</div>
          <pre className="text-sm whitespace-pre-wrap text-red-700">
            {err?.message || "Erreur inconnue."}
          </pre>
          <div className="text-xs text-gray-500 mt-2">
            Vérifie la variable NEXT_PUBLIC_API_BASE_URL et que les endpoints /overview, /gainers/top, /losers/top sont publics.
          </div>
        </div>
      </main>
    );
  }
}
