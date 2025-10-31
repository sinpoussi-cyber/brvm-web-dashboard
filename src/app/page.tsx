// src/app/page.tsx
import React from 'react';
import StatsCards from '@/src/components/StatsCards';
import IndexSwitcher from '@/src/components/IndexSwitcher';
import TopMovers from '@/src/components/TopMovers';
import SignupForm from '@/src/components/SignupForm';
import { fetchOverview } from '@/src/lib/api';
import { supabase } from '@/src/lib/supabaseClient';

export const revalidate = 60;

export default async function HomePage() {
  // Récupération parallèle : backend overview (API Render) + snapshot Supabase
  const [overview, homeSnap] = await Promise.all([
    fetchOverview().catch(()=>null),
    supabase.rpc('home_latest_snapshot').then(({data}) => Array.isArray(data) ? data[0] : data).catch(()=>null)
  ]);

  const lastDate = homeSnap?.last_extraction_date || null;
  const cap = homeSnap?.capitalisation_globale ?? undefined;
  const vol = homeSnap?.volume_moyen_annuel ?? undefined;
  const val = homeSnap?.valeur_moyenne_annuelle ?? undefined;

  const totalCompanies = overview?.overview?.total_companies ?? undefined;
  // Si ton backend fournit YTD Composite dans overview → sinon laisse undefined
  const ytdComposite = overview?.overview?.ytd_composite ?? undefined;

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-6">
      <header className="rounded-2xl p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h1 className="text-2xl font-bold">BRVM — Accueil</h1>
        <p className="text-sm opacity-90">
          Dernières tendances du marché, tops, et inscription utilisateur.
        </p>
      </header>

      <StatsCards
        lastDate={lastDate ?? undefined}
        totalCompanies={totalCompanies}
        cap={cap}
        vol={vol}
        val={val}
        ytdComposite={ytdComposite}
      />

      <IndexSwitcher />

      <TopMovers />

      <SignupForm />

      <section className="rounded-2xl p-4 shadow bg-white">
        <div className="text-lg font-semibold">Résumé analyse fonda. & technique</div>
        <p className="text-sm text-gray-600 mt-2">
          À connecter à tes endpoints/SQL dédiés (par ex. vues agrégées Supabase ou endpoints Render).
          Pour l’instant c’est un placeholder.
        </p>
      </section>
    </main>
  );
}
