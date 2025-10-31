// src/app/fundamentals/[symbol]/page.tsx
import React from 'react';
import { fetchCompanyFundamentals } from '@/lib/api';

export default async function CompanyFundamentalsPage({ params }: { params: { symbol: string } }) {
  const data = await fetchCompanyFundamentals(params.symbol);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analyse fondamentale — {params.symbol}</h1>
      <div className="rounded-2xl border p-4 bg-white">
        {data ? (
          <pre className="text-xs text-gray-700 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <div className="text-sm text-gray-500">Pas de données pour cette société.</div>
        )}
      </div>
    </div>
  );
}
