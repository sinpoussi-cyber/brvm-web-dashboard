'use client';

import { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import { getRecommendations } from '@/lib/api';

type Recommendation = {
  symbol: string;
  sector?: string;
  recommendation?: string;
  overall_signal?: string;
};

function isBuy(value?: string | null) {
  return value ? /achat/i.test(value) || /buy/i.test(value) : false;
}

function isSell(value?: string | null) {
  return value ? /vente/i.test(value) || /sell/i.test(value) : false;  
}

export default function RecommendationsPage() {
  const [items, setItems] = useState<Recommendation[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getRecommendations();
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur chargement recommandations', error);
        setItems([]);
      }
    })();
  }, []);

  const { buy, sell } = useMemo(() => {
    const buyList = items
      .filter((item) => isBuy(item.recommendation) || isBuy(item.overall_signal))
      .slice(0, 10);
    const sellList = items
      .filter((item) => isSell(item.recommendation) || isSell(item.overall_signal))
      .slice(0, 10);
    return { buy: buyList, sell: sellList };
  }, [items]);
  
  return (
    <div className="p-6 space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold mb-4">Recommandations d’investissement</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-green-600 mb-2">Top 10 — Actions à acheter</h2>
            {buy.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune recommandation d’achat disponible pour le moment.</p>
            ) : (
              <ul className="list-disc ml-6 text-sm space-y-1">
                {buy.map((item) => (
                  <li key={`buy-${item.symbol}`}>
                    {item.symbol} {item.sector ? `(${item.sector})` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-red-600 mb-2">Top 10 — Actions à vendre</h2>
            {sell.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune recommandation de vente disponible pour le moment.</p>
            ) : (
              <ul className="list-disc ml-6 text-sm space-y-1">
                {sell.map((item) => (
                  <li key={`sell-${item.symbol}`}>
                    {item.symbol} {item.sector ? `(${item.sector})` : ''}
                  </li>
                ))}
              </ul>
            )}
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
            {items.map((item) => {
              const signal = item.recommendation ?? item.overall_signal ?? '—';
              const colorClass = isBuy(signal)
                ? 'text-green-600'
                : isSell(signal)
                ? 'text-red-600'
                : 'text-gray-600';
              return (
                <tr key={`row-${item.symbol}`} className="border-b">
                  <td className="p-2">{item.symbol}</td>
                  <td className="p-2">{item.sector ?? '—'}</td>
                  <td className={`p-2 font-medium ${colorClass}`}>{signal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
