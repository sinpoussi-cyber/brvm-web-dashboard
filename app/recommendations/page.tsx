'use client';

import { useEffect, useState } from 'react';
import {
  fetchCompanies,
  fetchTechnicalSummary,
  fetchFundamentalSummary,
  type CompanyLite,
  type TechnicalSummary,
  type FundamentalSummary,
} from '@/lib/api';
import Card from '@/components/ui/Card';

type Recommendation = {
  symbol: string;
  name?: string;
  tech?: TechnicalSummary;
  fund?: FundamentalSummary;
  signal: 'Acheter' | 'Conserver' | 'Vendre';
  confidence: number;
};

export default function RecommendationsPage() {
  const [companies, setCompanies] = useState<CompanyLite[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await fetchCompanies();
      setCompanies(list);
    })();
  }, []);

  async function generateRecommendations() {
    setLoading(true);
    const recs: Recommendation[] = [];

    for (const c of companies) {
      try {
        const [tech, fund] = await Promise.all([
          fetchTechnicalSummary(c.symbol),
          fetchFundamentalSummary(c.symbol),
        ]);

        // Agrégation simple
        const txt = (fund?.summary || '').toLowerCase();
        const pos = /croissance|amélioration|bénéfice|rentabilité|progression|dividende/.test(txt);
        const neg = /baisse|perte|diminution|dégradation|risque/.test(txt);

        let signal: 'Acheter' | 'Conserver' | 'Vendre' = 'Conserver';
        let confidence = 0.5;

        if (tech.overall === 'Achat' && pos) {
          signal = 'Acheter';
          confidence = 0.9;
        } else if (tech.overall === 'Vente' && neg) {
          signal = 'Vendre';
          confidence = 0.9;
        } else if (tech.overall === 'Achat' || pos) {
          signal = 'Acheter';
          confidence = 0.7;
        } else if (tech.overall === 'Vente' || neg) {
          signal = 'Vendre';
          confidence = 0.7;
        }

        recs.push({ symbol: c.symbol, name: c.name, tech, fund, signal, confidence });
      } catch {
        continue;
      }
    }

    setRecommendations(recs);
    setLoading(false);
  }

  const topBuy = recommendations
    .filter((r) => r.signal === 'Acheter')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);

  const topSell = recommendations
    .filter((r) => r.signal === 'Vendre')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Recommandations d’investissement — BRVM</h1>

      <Card>
        <button
          onClick={generateRecommendations}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl"
          disabled={loading || !companies.length}
        >
          {loading ? 'Analyse en cours…' : 'Générer les recommandations'}
        </button>
      </Card>

      {/* TOP 10 Achat */}
      {topBuy.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-3 text-green-600">
            🟢 Top 10 Actions à Acheter
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-green-50">
                <th className="text-left py-2 px-3">Symbole</th>
                <th className="text-left py-2 px-3">Société</th>
                <th className="text-left py-2 px-3">Confiance</th>
              </tr>
            </thead>
            <tbody>
              {topBuy.map((r) => (
                <tr key={r.symbol} className="border-b">
                  <td className="py-2 px-3 font-semibold">{r.symbol}</td>
                  <td className="py-2 px-3">{r.name ?? '—'}</td>
                  <td className="py-2 px-3">{(r.confidence * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* TOP 10 Vente */}
      {topSell.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-3 text-red-600">
            🔴 Top 10 Actions à Vendre / Éviter
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-red-50">
                <th className="text-left py-2 px-3">Symbole</th>
                <th className="text-left py-2 px-3">Société</th>
                <th className="text-left py-2 px-3">Confiance</th>
              </tr>
            </thead>
            <tbody>
              {topSell.map((r) => (
                <tr key={r.symbol} className="border-b">
                  <td className="py-2 px-3 font-semibold">{r.symbol}</td>
                  <td className="py-2 px-3">{r.name ?? '—'}</td>
                  <td className="py-2 px-3">{(r.confidence * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Liste complète */}
      {recommendations.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-3">📊 Toutes les actions</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2 px-3">Symbole</th>
                <th className="text-left py-2 px-3">Société</th>
                <th className="text-left py-2 px-3">Signal</th>
                <th className="text-left py-2 px-3">Confiance</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((r) => (
                <tr key={r.symbol} className="border-b">
                  <td className="py-2 px-3 font-semibold">{r.symbol}</td>
                  <td className="py-2 px-3">{r.name ?? '—'}</td>
                  <td
                    className={`py-2 px-3 font-semibold ${
                      r.signal === 'Acheter'
                        ? 'text-green-600'
                        : r.signal === 'Vendre'
                        ? 'text-red-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {r.signal}
                  </td>
                  <td className="py-2 px-3">{(r.confidence * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
