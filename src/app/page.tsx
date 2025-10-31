// src/app/page.tsx
import { fetchMarketOverview, fetchTopGainers, fetchTopLosers } from '@/lib/api';
import { fetchCompositeLast20d } from '@/lib/supabase';
import { KpiCard } from '@/components/KpiCard';
import { IndexCard } from '@/components/IndexCard';
import { TopMovers } from '@/components/TopMovers';
import CompositeChart from '@/components/CompositeChart';
import SignupForm from '@/components/SignupForm';

export default async function HomePage() {
  // Backend Render
  const [overview, gainers, losers] = await Promise.all([
    fetchMarketOverview(),
    fetchTopGainers(10),
    fetchTopLosers(10),
  ]);

  // RPC Supabase (Composite 20j)
  const composite20d = await fetchCompositeLast20d();

  const lastUpdate = overview.last_update ? new Date(overview.last_update).toLocaleDateString() : '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-semibold">Marché BRVM — Vue d’ensemble</h1>
        <p className="text-gray-500 text-sm">Dernière date enregistrée : {lastUpdate} • Sociétés cotées : {overview.total_companies ?? '—'}</p>
      </div>

      {/* Indices */}
      <div className="grid md:grid-cols-4 gap-4">
        <IndexCard label="BRVM Composite" value={overview.indices?.brvm_composite} />
        <IndexCard label="BRVM 30" value={overview.indices?.brvm_30} />
        <IndexCard label="BRVM Prestige" value={overview.indices?.brvm_prestige} />
        <IndexCard label="BRVM Croissance" value={overview.indices?.brvm_croissance} />
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-3 gap-4">
        <KpiCard title="Capitalisation Globale" value={overview.capitalisation_globale?.toLocaleString()} sub="Dernière valeur" />
        <KpiCard title="Volume Moyen Annuel" value={overview.volume_moyen_annuel?.toLocaleString()} sub="Dernière valeur" />
        <KpiCard title="Valeur Moyenne Annuelle" value={overview.valeur_moyenne_annuelle?.toLocaleString()} sub="Dernière valeur" />
      </div>

      {/* Graphique Composite 20 jours */}
      <CompositeChart data={composite20d} />

      {/* Top Movers */}
      <TopMovers gainers={gainers} losers={losers} />

      {/* Formulaire d’inscription */}
      <SignupForm />
    </div>
  );
}
