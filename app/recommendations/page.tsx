'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabaseClient';

interface Recommendation {
  symbol: string;
  recommendation: string;
  sector: string;
}

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendation[]>([]);

  useEffect(() => {
    supabase
      .from('technical_analysis')
      .select('symbol, recommendation, sector')
      .then(({ data }) => {
        if (data) setRecs(data);
      });
  }, []);

  const topBuy = recs.filter((r) => r.recommendation?.includes('Achat')).slice(0, 10);
  const topSell = recs.filter((r) => r.recommendation?.includes('Vente')).slice(0, 10);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold mb-4">Recommandations d’investissement</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-green-600 mb-2">Top 10 - Actions à acheter</h2>
            <ul className="list-disc ml-6">
              {topBuy.map((r) => (
                <li key={r.symbol}>
                  {r.symbol} ({r.sector})
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-red-600 mb-2">Top 10 - Actions à vendre</h2>
            <ul className="list-disc ml-6">
              {topSell.map((r) => (
                <li key={r.symbol}>
                  {r.symbol} ({r.sector})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold mb-3">Liste complète</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Symbole</th>
              <th className="text-left p-2">Secteur</th>
              <th className="text-left p-2">Recommandation</th>
            </tr>
          </thead>
          <tbody>
            {recs.map((r) => (
              <tr key={r.symbol} className="border-b">
                <td className="p-2">{r.symbol}</td>
                <td className="p-2">{r.sector}</td>
                <td
                  className={`p-2 ${
                    r.recommendation?.includes('Achat')
                      ? 'text-green-600'
                      : r.recommendation?.includes('Vente')
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {r.recommendation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
