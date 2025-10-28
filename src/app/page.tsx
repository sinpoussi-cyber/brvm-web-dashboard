import { api } from "@/lib/api";
import { KPI } from "@/components/KPI";
import { TopTable } from "@/components/TopTable";
import { SectorsBar } from "@/components/SectorsBar";
import { LogsViewer } from "@/components/LogsViewer";

const sampleBuildLogs = [
  "Find in logs",
  "CtrlF",
  "Running build in Washington, D.C., USA (East) – iad1",
  "Build machine configuration: 2 cores, 8 GB",
  "Cloning github.com/sinpoussi-cyber/brvm-web-dashboard (Branch: main, Commit: 344741e)",
  "Cloning completed: 323.000ms",
  "Restored build cache from previous deployment (9apeydAf6FXYZqmSkNxjMEZ3GSkt)",
  "Running \"vercel build\"",
  "Vercel CLI 48.6.0",
  "Running \"install\" command: `npm install --legacy-peer-deps`...",
  "up to date, audited 182 packages in 2s",
  "35 packages are looking for funding",
  "  run `npm fund` for details",
  "1 critical severity vulnerability",
  "To address all issues, run:",
];

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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <SectorsBar data={overview.top_sectors || []} />
            <LogsViewer logs={sampleBuildLogs} />
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
