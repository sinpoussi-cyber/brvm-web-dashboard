'use client';

import { useEffect, useState } from 'react';
import {
  fetchIndicesOverview,
  fetchMarketStats,
  fetchTopGainers,
  fetchTopLosers,
  fetchFundamentalGlobalSummary,
  fetchTechnicalGlobalSummary,
} from '@/lib/api';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Types locaux
type IndexData = {
  name: string;
  value: number;
  variation_daily: number;
  variation_ytd: number;
  history?: { date: string; value: number }[];
};

type MarketStats = {
  date: string;
  total_companies: number;
  capitalisation_globale: number;
  variation_j_cap: number;
  volume_moyen_annuel: number;
  variation_j_vol: number;
  valeur_moyenne_annuelle: number;
  variation_j_val: number;
};

export default function HomePage() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [market, setMarket] = useState<MarketStats | null>(null);
  const [gainers, setGainers] = useState<any[]>([]);
  const [losers, setLosers] = useState<any[]>([]);
  const [techSummary, setTechSummary] = useState('');
  const [fundSummary, setFundSummary] = useState('');

  // Récupérer données au chargement
  useEffect(() => {
    (async () => {
      try {
        const i = await fetchIndicesOverview();
        const m = await fetchMarketStats();
        const g = await fetchTopGainers();
        const l = await fetchTopLosers();
        const t = await fetchTechnicalGlobalSummary();
        const f = await fetchFundamentalGlobalSummary();

        setIndices(i);
        setMarket(m);
        setGainers(g.slice(0, 5));
        setLosers(l.slice(0, 5));
        setTechSummary(t.summary);
        setFundSummary(f.summary);
      } catch (e) {
        console.error('Erreur chargement Accueil :', e);
      }
    })();
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📊 BRVM Dashboard</h1>
        <div className="space-x-4">
          <Link
            href="/auth/register"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Créer un compte
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50"
          >
            Se connecter
          </Link>
        </div>
      </div>

      {/* INDICES PRINCIPAUX */}
      <div className="grid md:grid-cols-4 gap-4">
        {indices.map((i) => (
          <Card key={i.name} className="p-4">
            <div className="font-semibold text-lg">{i.name}</div>
            <div className="text-2xl font-bold mt-1">{i.value.toFixed(2)}</div>
            <div className="text-sm mt-1">
              <span
                className={
                  i.variation_daily >= 0 ? 'text-green-600' : 'text-red-600'
                }
              >
                {i.variation_daily >= 0 ? '+' : ''}
                {i.variation_daily.toFixed(2)}% (Jour)
              </span>
              {' • '}
              <span
                className={
                  i.variation_ytd >= 0 ? 'text-green-600' : 'text-red-600'
                }
              >
                {i.variation_ytd >= 0 ? '+' : ''}
                {i.variation_ytd.toFixed(2)}% (YTD)
              </span>
            </div>
            {i.history && i.history.length > 0 && (
              <div className="mt-3 h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={i.history}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                    />
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* STATISTIQUES DE MARCHÉ */}
      {market && (
        <Card>
          <h2 className="text-xl font-semibold mb-3">📈 Statistiques du marché</h2>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-gray-500 text-sm">Date</p>
              <p className="font-semibold">{market.date}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Sociétés cotées</p>
              <p className="font-semibold">{market.total_companies}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Capitalisation Globale</p>
              <p className="font-semibold text-blue-600">
                {market.capitalisation_globale.toLocaleString()} FCFA
              </p>
              <p
                className={
                  market.variation_j_cap >= 0
                    ? 'text-green-600 text-sm'
                    : 'text-red-600 text-sm'
                }
              >
                {market.variation_j_cap >= 0 ? '+' : ''}
                {market.variation_j_cap.toFixed(2)}% (Jour)
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Volume Moyen Annuel</p>
              <p className="font-semibold text-blue-600">
                {market.volume_moyen_annuel.toLocaleString()} titres
              </p>
              <p
                className={
                  market.variation_j_vol >= 0
                    ? 'text-green-600 text-sm'
                    : 'text-red-600 text-sm'
                }
              >
                {market.variation_j_vol >= 0 ? '+' : ''}
                {market.variation_j_vol.toFixed(2)}% (Jour)
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Valeur Moyenne Annuelle</p>
              <p className="font-semibold text-blue-600">
                {market.valeur_moyenne_annuelle.toLocaleString()} FCFA
              </p>
              <p
                className={
                  market.variation_j_val >= 0
                    ? 'text-green-600 text-sm'
                    : 'text-red-600 text-sm'
                }
              >
                {market.variation_j_val >= 0 ? '+' : ''}
                {market.variation_j_val.toFixed(2)}% (Jour)
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TOP & FLOP 5 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-2 text-green-600">
            🟢 Top 5 des Performances
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-green-50">
                <th className="text-left py-2 px-3">Symbole</th>
                <th className="text-left py-2 px-3">Variation</th>
              </tr>
            </thead>
            <tbody>
              {gainers.map((g) => (
                <tr key={g.symbol} className="border-b">
                  <td className="py-2 px-3 font-semibold">{g.symbol}</td>
                  <td className="py-2 px-3 text-green-600 font-semibold">
                    +{g.change_percent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-2 text-red-600">
            🔴 Flop 5 des Performances
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-red-50">
                <th className="text-left py-2 px-3">Symbole</th>
                <th className="text-left py-2 px-3">Variation</th>
              </tr>
            </thead>
            <tbody>
              {losers.map((l) => (
                <tr key={l.symbol} className="border-b">
                  <td className="py-2 px-3 font-semibold">{l.symbol}</td>
                  <td className="py-2 px-3 text-red-600 font-semibold">
                    {l.change_percent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* RÉSUMÉS */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-2">📘 Résumé Analyse Fondamentale</h2>
          <p className="text-sm whitespace-pre-wrap">{fundSummary}</p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-2">📗 Résumé Analyse Technique</h2>
          <p className="text-sm whitespace-pre-wrap">{techSummary}</p>
        </Card>
      </div>
    </div>
  );
}
