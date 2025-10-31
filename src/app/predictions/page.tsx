// src/app/predictions/page.tsx
import React from 'react';
import { fetchPredictions, fetchListings } from '@/lib/api';
import LineBlock from '@/components/LineBlock';

export default async function PredictionsPage({
  searchParams,
}: { searchParams: { symbol?: string } }) {
  const listings = await fetchListings();
  const symbol = searchParams.symbol || listings.symbols[0] || 'ORAC';
  const data = await fetchPredictions(symbol);

  const merged = [
    ...data.history.map(h => ({ date: h.date, price: h.price, kind: 'historique' })),
    ...data.forecast.map(f => ({ date: f.date, price: f.price, kind: 'prévision' })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Prédictions</h1>
        <select
          defaultValue={symbol}
          onChange={(e)=>{window.location.href=`/predictions?symbol=${encodeURIComponent(e.target.value)}`}}
          className="border rounded-xl px-3 py-2 text-sm bg-white"
        >
          {listings.symbols.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <LineBlock title={`${symbol} — Historique & Prévision`} data={merged} xKey="date" yKey="price" />
    </div>
  );
}
