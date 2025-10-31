// src/app/signals/page.tsx
import React from 'react';
import { fetchSignals, fetchTopGainers, fetchTopLosers } from '@/lib/api';

export default async function SignalsPage() {
  let sig = await fetchSignals();
  // Fallback simple si pas d’endpoint de signaux → heuristique gainers/losers
  if ((sig.buys?.length ?? 0) === 0 && (sig.sells?.length ?? 0) === 0) {
    const [g, l] = await Promise.all([fetchTopGainers(10), fetchTopLosers(10)]);
    sig = {
      buys: g.map((x) => ({ symbol: x.symbol, score: x.change_percent })),
      sells: l.map((x) => ({ symbol: x.symbol, score: Math.abs(x.change_percent) })),
    };
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Récapitulatif — Achats & Ventes</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 bg-white">
          <div className="text-sm font-medium mb-3">Top 10 — À acheter</div>
          <ul className="space-y-2 text-sm">
            {sig.buys.map((b) => (
              <li key={b.symbol} className="flex justify-between border-b py-2">
                <span className="font-medium">{b.symbol}</span>
                <span className="text-emerald-600">{b.score.toFixed(2)}</span>
              </li>
            ))}
            {sig.buys.length === 0 && <li className="text-gray-500">Aucun signal</li>}
          </ul>
        </div>

        <div className="rounded-2xl border p-4 bg-white">
          <div className="text-sm font-medium mb-3">Top 10 — À vendre/Éviter</div>
          <ul className="space-y-2 text-sm">
            {sig.sells.map((s) => (
              <li key={s.symbol} className="flex justify-between border-b py-2">
                <span className="font-medium">{s.symbol}</span>
                <span className="text-red-600">{s.score.toFixed(2)}</span>
              </li>
            ))}
            {sig.sells.length === 0 && <li className="text-gray-500">Aucun signal</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
