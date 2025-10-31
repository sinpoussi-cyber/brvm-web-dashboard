// src/app/fundamentals/page.tsx
import React from 'react';
import { fetchFundamentalsSummary, fetchListings } from '@/lib/api';

export default async function FundamentalsPage() {
  const [summary, listings] = await Promise.all([
    fetchFundamentalsSummary(),
    fetchListings(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analyse fondamentale — Vue globale</h1>

      <div className="rounded-2xl border p-4 bg-white">
        <div className="text-sm font-medium mb-3">Highlights / Agrégats</div>
        <pre className="text-xs text-gray-700 overflow-auto">{JSON.stringify(summary, null, 2)}</pre>
      </div>

      <div className="rounded-2xl border p-4 bg-white">
        <div className="text-sm font-medium mb-3">Par société</div>
        <div className="flex gap-2 flex-wrap">
          {listings.symbols.map((s) => (
            <a key={s} href={`/fundamentals/${encodeURIComponent(s)}`} className="px-3 py-2 rounded-xl border text-sm bg-white hover:bg-gray-50">
              {s}
            </a>
          ))}
          {listings.symbols.length === 0 && (
            <div className="text-sm text-gray-500">Aucune liste disponible depuis l’API.</div>
          )}
        </div>
      </div>
    </div>
  );
}
