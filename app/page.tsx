'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchOverview, fetchTopGainers, fetchTopLosers } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import Card from '@/components/ui/Card';
import Stat from '@/components/ui/Stat';

type IndexData = {
  name: string;
  value: number;
  variation_daily: number;
  variation_ytd: number;
};

type MarketMetrics = {
  capitalisation_globale: number;
  variation_journaliere_capitalisation_globale: number;
  volume_moyen_annuel: number;
  variation_journaliere_volume_moyen_annuel: number;
  valeur_moyenne_annuelle: number;
  variation_journaliere_valeur_moyenne_annuelle: number;
  total_companies: number;
  last_date: string;
};

type TopMove = {
  symbol: string;
  latest_price: number;
  change_percent: number;
};

export default function HomePage() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [metrics, setMetrics] = useState<MarketMetrics | null>(null);
  const [gainers, setGainers] = useState<TopMove[]>([]);
  const [losers, setLosers] = useState<TopMove[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 1️⃣ Fetch indices (RPC)
        const { data: ind } = await supabase
          .from('new_market_indicators')
          .select('*')
          .order('extraction_date', { ascending: false })
          .limit(1)
          .single();

        if (ind) {
          setIndices([
            { name: 'BRVM Composite', value: ind.brvm_composite, variation_daily: ind.variation_journaliere_brvm_composite, variation_ytd: ind.variation_ytd_brvm_composite },
            { name: 'BRVM 30', value: ind.brvm_30, variation_daily: ind.variation_journaliere_brvm_30, variation_ytd: ind.variation_ytd_brvm_30 },
            { name: 'BRVM Prestige', value: ind.brvm_prestige, variation_daily: ind.variation_journaliere_brvm_prestige, variation_ytd: ind.variation_ytd_brvm_prestige },
            { name: 'BRVM Principal', value: ind.brvm_croissance, variation_daily: ind.variation_journaliere_brvm_croissance, variation_ytd: ind.variation_ytd_brvm_croissance },
          ]);

          setMetrics({
            capitalisation_globale: ind.capitalisation_globale,
            variation_journaliere_capitalisation_globale: ind.variation_journaliere_capitalisation_globale,
            volume_moyen_annuel: ind.volume_moyen_annuel,
            variation_journaliere_volume_moyen_annuel: ind.variation_journaliere_volume_moyen_annuel,
            valeur_moyenne_annuelle: ind.valeur_moyenne_annuelle,
            variation_journaliere_valeur_moyenne_annuelle: ind.variation_journaliere_valeur_moyenne_annuelle,
            total_companies: 46, // Peut être dynamique
            last_date: ind.extraction_date,
          });
        }

        // 2️⃣ Fetch Top gainers / losers
        const [g, l] = await Promise.all([
          fetchTopGainers(5),
          fetchTopLosers(5),
        ]);

        setGainers(g);
        setLosers(l);
      } catch (err) {
        console.error('Erreur de chargement :', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="text-center py-10">Chargement des données...</div>;

  return (
    <div className="space-y-10 p-6">
      {/* HEADER + Connexion */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">BRVM Analysis Suite</h1>
        <div className="space-x-3">
          <Link href="/auth/login" className="bg-gray-800 text-white px-4 py-2 rounded-xl">Se connecter</Link>
          <Link href="/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded-xl">Créer un compte</Link>
        </div>
      </div>

      {/* 1️⃣ Indices BRVM */}
      <Card>
        <div className="grid md:grid-cols-4 gap-4">
          {indices.map((idx) => (
            <div key={idx.name} className="border-r last:border-r-0 pr-4">
              <div className="text-sm text-gray-500">{idx.name}</div>
              <div className="text-2xl font-semibold">{idx.value.toFixed(2)}</div>
              <div className={`text-sm ${idx.variation_daily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {idx.variation_daily.toFixed(2)}% (Jour)
              </div>
              <div className={`text-xs ${idx.variation_ytd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {idx.variation_ytd.toFixed(2)}% (YTD)
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 2️⃣ Marché Global */}
      {metrics && (
        <Card>
          <div className="grid md:grid-cols-4 gap-4">
            <Stat label="Capitalisation Globale (Mds FCFA)" value={metrics.capitalisation_globale.toLocaleString()} sub={`${metrics.variation_journaliere_capitalisation_globale.toFixed(2)}%`} />
            <Stat label="Volume Moyen Annuel" value={metrics.volume_moyen_annuel.toLocaleString()} sub={`${metrics.variation_journaliere_volume_moyen_annuel.toFixed(2)}%`} />
            <Stat label="Valeur Moyenne Annuelle" value={metrics.valeur_moyenne_annuelle.toLocaleString()} sub={`${metrics.variation_journaliere_valeur_moyenne_annuelle.toFixed(2)}%`} />
            <Stat label="Sociétés cotées" value={String(metrics.total_companies)} sub={`Dernière mise à jour : ${metrics.last_date}`} />
          </div>
        </Card>
      )}

      {/* 3️⃣ Top Gagnants / Perdants */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="font-semibold mb-3">Top 5 Gagnants</div>
          <table className="w-full text-sm">
            <thead><tr><th>Symbole</th><th>Dernier</th><th>%</th></tr></thead>
            <tbody>
              {gainers.map(g => (
                <tr key={g.symbol}>
                  <td>{g.symbol}</td>
                  <td>{g.latest_price.toFixed(2)}</td>
                  <td className="text-green-600">{g.change_percent.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <div className="font-semibold mb-3">Flop 5</div>
          <table className="w-full text-sm">
            <thead><tr><th>Symbole</th><th>Dernier</th><th>%</th></tr></thead>
            <tbody>
              {losers.map(l => (
                <tr key={l.symbol}>
                  <td>{l.symbol}</td>
                  <td>{l.latest_price.toFixed(2)}</td>
                  <td className="text-red-600">{l.change_percent.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* 4️⃣ Résumés Analyses */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="text-lg font-semibold mb-2">Résumé Analyse Technique</div>
          <p className="text-sm text-gray-600">
            Synthèse des signaux de tendance, momentum et volatilité à partir des indicateurs MACD, RSI, Stochastique et Moyennes Mobiles.
            <Link href="/technical" className="text-blue-600 ml-2">Voir plus</Link>
          </p>
        </Card>
        <Card>
          <div className="text-lg font-semibold mb-2">Résumé Analyse Fondamentale</div>
          <p className="text-sm text-gray-600">
            Analyse IA des rapports financiers des sociétés cotées : croissance, rentabilité, et politique de dividendes.
            <Link href="/fundamental" className="text-blue-600 ml-2">Voir plus</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
