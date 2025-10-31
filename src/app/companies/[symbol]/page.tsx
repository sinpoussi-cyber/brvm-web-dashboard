// src/app/companies/[symbol]/page.tsx
import React from 'react';
import { fetchCompanyFundamentals, fetchPredictions, fetchQuote } from '@/lib/api';
import LineBlock from '@/components/LineBlock';

export default async function CompanyPage({ params }: { params: { symbol: string } }) {
  const [fund, pred, quote] = await Promise.all([
    fetchCompanyFundamentals(params.symbol),
    fetchPredictions(params.symbol),
    fetchQuote(params.symbol),
  ]);

  const merged = [
    ...pred.history.map(h => ({ date: h.date, price: h.price })),
    ...pred.forecast.map(f => ({ date: f.date, price: f.price })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Fiche société — {params.symbol}</h1>
        <div className="rounded-xl border bg-white px-3 py-2 text-sm">
          Cours: <span className="font-semibold">{quote.price?.toLocaleString()}</span> • Var: {quote.change_percent?.toFixed(2)}%
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 bg-white">
          <div className="text-sm font-medium mb-2">Analyse fondamentale</div>
          {fund ? (
            <pre className="text-xs text-gray-700 overflow-auto">{JSON.stringify(fund, null, 2)}</pre>
          ) : (
            <div className="text-sm text-gray-500">Aucune donnée fondamentale.</div>
          )}
        </div>
        <LineBlock title="Cours (historique + prévisions)" data={merged} xKey="date" yKey="price" />
      </div>

      <div className="rounded-2xl border p-4 bg-white">
        <div className="text-sm font-medium mb-2">Recommandation</div>
        <div className="text-sm text-gray-700">
          {/* Placeholder — Tu pourras brancher un endpoint de scoring/reco ici */}
          Recommandation automatique: <span className="font-semibold">Conserver</span> (exemple)
        </div>
      </div>
    </div>
  );
}
