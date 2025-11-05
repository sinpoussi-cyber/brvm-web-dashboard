'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import Card from '@/components/ui/Card';
import {
  fetchIndicesOverview,
  fetchMarketStats,
  fetchTopGainers,
  fetchTopLosers,
  fetchFundamentalGlobalSummary,
  fetchTechnicalGlobalSummary,
  type IndexOverview,
  type MarketStats,
  type TopMove,
} from '@/lib/api';

const numberFmt = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 2,
});

const percentFmt = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type MetricKey = 'capitalisation' | 'volume' | 'valeur';

type ActiveMetric = {
  key: MetricKey;
  title: string;
};

type MetricHistoryRow = {
  date: string;
  value: number;
  variation_daily?: number;
  variation_ytd?: number;
};

type UserProfile = {
  first_name?: string;
  last_name?: string;
  email?: string;
};

export default function HomePage() {
  const [indices, setIndices] = useState<IndexOverview[]>([]);
  const [market, setMarket] = useState<MarketStats | null>(null);
  const [gainers, setGainers] = useState<TopMove[]>([]);
  const [losers, setLosers] = useState<TopMove[]>([]);
  const [techSummary, setTechSummary] = useState('');
  const [fundSummary, setFundSummary] = useState('');
  const [activeIndex, setActiveIndex] = useState<IndexOverview | null>(null);
  const [activeMetric, setActiveMetric] = useState<ActiveMetric | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
     const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (error) {
        console.warn('Impossible de lire le profil utilisateur', error);
      }
    }
  }, []);
  
useEffect(() => {
    (async () => {
      try {
        const [idx, mk, tg, tl, tech, fund] = await Promise.all([
          fetchIndicesOverview(),
          fetchMarketStats(),
          fetchTopGainers(5),
          fetchTopLosers(5),
          fetchTechnicalGlobalSummary(),
          fetchFundamentalGlobalSummary(),
        ]);
        setIndices(idx);
        if (mk) setMarket(mk);
        setGainers(tg);
        setLosers(tl);
        setTechSummary(tech.summary);
        setFundSummary(fund.summary);
      } catch (error) {
        console.error('Erreur chargement Accueil :', error);
      }
    })();
  }, []);

  const metricHistory = useMemo(() => {
    const history = market?.history ?? [];
    const parse = (key: MetricKey) =>
      history
        .map<MetricHistoryRow | null>((row) => {
          const config = {
            capitalisation: {
              value: row.capitalisation_globale,
              daily: row.variation_j_cap,
              ytd: row.variation_ytd_cap,
            },
            volume: {
              value: row.volume_moyen_annuel,
              daily: row.variation_j_vol,
              ytd: row.variation_ytd_vol,
            },
            valeur: {
              value: row.valeur_moyenne_annuelle,
              daily: row.variation_j_val,
              ytd: row.variation_ytd_val,
            },
          } as const;
          const target = config[key];
          if (target.value === undefined || target.value === null) return null;
          if (!row.date) return null;
          return {
            date: row.date,
            value: Number(target.value),
            variation_daily:
              target.daily !== undefined && target.daily !== null
                ? Number(target.daily)
                : undefined,
            variation_ytd:
              target.ytd !== undefined && target.ytd !== null
                ? Number(target.ytd)
                : undefined,
          } satisfies MetricHistoryRow;
        })
        .filter((row): row is MetricHistoryRow => Boolean(row));
    return {
      capitalisation: parse('capitalisation'),
      volume: parse('volume'),
      valeur: parse('valeur'),
    };
  }, [market?.history]);

  const userDisplayName = user?.first_name
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
    : null;

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
       <div className="flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📊 BRVM Dashboard</h1>
          {userDisplayName && (
            <p className="text-sm text-gray-600 mt-1">
              Bienvenue {userDisplayName}, retrouvez vos analyses personnalisées.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {userDisplayName && (
            <>
              <span className="text-sm text-gray-600">{userDisplayName}</span>
              <Link
                href="/payment"
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              >
                Payer mon abonnement
              </Link>
            </>
          )}
          <Link
            href="/auth/login"
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50"
          >
            Se connecter
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Créer un compte
          </Link>
        </div>
      </div>

      {/* INDICES PRINCIPAUX */}
      <div className="grid md:grid-cols-4 gap-4">
        {indices.map((indice) => (
          <Card
            key={indice.code}
            className="p-4 cursor-pointer transition hover:shadow-md"
            onClick={() => setActiveIndex(indice)}
          >
            <div className="font-semibold text-lg">{indice.name}</div>
            <div className="text-2xl font-bold mt-1">{numberFmt.format(indice.value)}</div>
            <div className="text-sm mt-1 space-x-2">
              <span className={indice.variation_daily >= 0 ? 'text-green-600' : 'text-red-600'}>
                {indice.variation_daily >= 0 ? '+' : ''}
                {percentFmt.format(indice.variation_daily)}% (Jour)
              </span>
              <span className={indice.variation_ytd >= 0 ? 'text-green-600' : 'text-red-600'}>
                {indice.variation_ytd >= 0 ? '+' : ''}
                {percentFmt.format(indice.variation_ytd)}% (YTD)
              </span>
            </div>
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
            <button
              type="button"
              onClick={() => setActiveMetric({ key: 'capitalisation', title: 'Capitalisation Globale' })}
              className="rounded-2xl border p-3 bg-blue-50 hover:bg-blue-100 transition"
            >
              <p className="text-gray-500 text-xs">Capitalisation Globale</p>
              <p className="font-semibold text-blue-700">
                {numberFmt.format(market.capitalisation_globale)} FCFA
              </p>
              <p className={market.variation_j_cap >= 0 ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                {market.variation_j_cap >= 0 ? '+' : ''}
                {percentFmt.format(market.variation_j_cap)}% / jour
              </p>
              <p className={
                market.variation_ytd_cap >= 0 ? 'text-green-600 text-xs' : 'text-red-600 text-xs'
              }>
                {market.variation_ytd_cap >= 0 ? '+' : ''}
                {percentFmt.format(market.variation_ytd_cap)}% / YTD
              </p>
              </button>
            <button
              type="button"
              onClick={() => setActiveMetric({ key: 'volume', title: 'Volume moyen annuel' })}
              className="rounded-2xl border p-3 bg-blue-50 hover:bg-blue-100 transition"
            >
              <p className="text-gray-500 text-xs">Volume moyen annuel</p>
              <p className="font-semibold text-blue-700">
                {numberFmt.format(market.volume_moyen_annuel)} titres
              </p>
              <p className={market.variation_j_vol >= 0 ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                {market.variation_j_vol >= 0 ? '+' : ''}
                {percentFmt.format(market.variation_j_vol)}% / jour
              </p>
              <p className={
                market.variation_ytd_vol >= 0 ? 'text-green-600 text-xs' : 'text-red-600 text-xs'
              }>
                {market.variation_ytd_vol >= 0 ? '+' : ''}
                {percentFmt.format(market.variation_ytd_vol)}% / YTD
              </p>
              </button>
            <button
              type="button"
              onClick={() => setActiveMetric({ key: 'valeur', title: 'Valeur moyenne annuelle' })}
              className="rounded-2xl border p-3 bg-blue-50 hover:bg-blue-100 transition"
            >
              <p className="text-gray-500 text-xs">Valeur moyenne annuelle</p>
              <p className="font-semibold text-blue-700">
                {numberFmt.format(market.valeur_moyenne_annuelle)} FCFA
              </p>
              <p className={market.variation_j_val >= 0 ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                {market.variation_j_val >= 0 ? '+' : ''}
                {percentFmt.format(market.variation_j_val)}% / jour
              </p>
              <p className={
                market.variation_ytd_val >= 0 ? 'text-green-600 text-xs' : 'text-red-600 text-xs'
              }>
                {market.variation_ytd_val >= 0 ? '+' : ''}
                {percentFmt.format(market.variation_ytd_val)}% / YTD
              </p>
            </button>
          </div>
        </Card>
      )}

      {/* TOP & FLOP 5 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
           <h2 className="text-lg font-semibold mb-2 text-green-600">🟢 Top 5 des Performances</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-green-50">
                <th className="text-left py-2 px-3">Symbole</th>
                <th className="text-left py-2 px-3">Cours</th>
                <th className="text-left py-2 px-3">Variation</th>
              </tr>
            </thead>
            <tbody>
              {gainers.map((item) => (
                <tr key={item.symbol} className="border-b">
                  <td className="py-2 px-3 font-semibold">{item.symbol}</td>
                  <td className="py-2 px-3">{numberFmt.format(item.latest_price)}</td>
                  <td className="py-2 px-3 text-green-600 font-semibold">
                    +{percentFmt.format(item.change_percent)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-2 text-red-600">🔴 Flop 5 des Performances</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-red-50">
                <th className="text-left py-2 px-3">Symbole</th>
                <th className="text-left py-2 px-3">Cours</th>
                <th className="text-left py-2 px-3">Variation</th>
              </tr>
            </thead>
            <tbody>
              {losers.map((item) => (
                <tr key={item.symbol} className="border-b">
                  <td className="py-2 px-3 font-semibold">{item.symbol}</td>
                  <td className="py-2 px-3">{numberFmt.format(item.latest_price)}</td>
                  <td className="py-2 px-3 text-red-600 font-semibold">
                    {percentFmt.format(item.change_percent)}%
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
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{fundSummary}</p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-2">📗 Résumé Analyse Technique</h2>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{techSummary}</p>
        </Card>
      </div>

      {/* Modal Indice */}
      {activeIndex && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-xl font-semibold">{activeIndex.name}</h3>
                <p className="text-sm text-gray-500">Historique des valeurs et variations</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Fermer ✕
              </button>
            </div>
            <div className="mt-4" style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeIndex.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" minTickGap={18} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <table className="w-full text-xs mt-4">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-right">Valeur</th>
                  <th className="p-2 text-right">Var. Jour</th>
                  <th className="p-2 text-right">Var. YTD</th>
                </tr>
              </thead>
              <tbody>
                {[...activeIndex.history]
                  .slice(-90)
                  .reverse()
                  .map((row) => (
                    <tr key={`${activeIndex.code}-${row.date}`} className="border-b">
                      <td className="p-2">{row.date}</td>
                      <td className="p-2 text-right">{numberFmt.format(row.value)}</td>
                      <td className="p-2 text-right">
                        {row.variation_daily !== undefined
                          ? `${percentFmt.format(row.variation_daily)}%`
                          : '—'}
                      </td>
                      <td className="p-2 text-right">
                        {row.variation_ytd !== undefined
                          ? `${percentFmt.format(row.variation_ytd)}%`
                          : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Statistique marché */}
      {activeMetric && market && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-xl font-semibold">{activeMetric.title}</h3>
                <p className="text-sm text-gray-500">Historique sur un mois</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMetric(null)}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Fermer ✕
              </button>
            </div>
            <div className="mt-4" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricHistory[activeMetric.key]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" minTickGap={18} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#f97316" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <table className="w-full text-xs mt-4">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-right">Valeur</th>
                  <th className="p-2 text-right">Var. Jour</th>
                  <th className="p-2 text-right">Var. YTD</th>
                </tr>
              </thead>
              <tbody>
                {[...metricHistory[activeMetric.key]]
                  .slice(-90)
                  .reverse()
                  .map((row) => (
                    <tr key={`${activeMetric.key}-${row.date}`} className="border-b">
                      <td className="p-2">{row.date}</td>
                      <td className="p-2 text-right">
                        {row.variation_daily !== undefined
                          ? `${percentFmt.format(row.variation_daily)}%`
                          : '—'}
                      </td>
                      <td className="p-2 text-right">
                        {row.variation_ytd !== undefined
                          ? `${percentFmt.format(row.variation_ytd)}%`
                          : '—'}
                      </td>
                      <td className="p-2 text-right">{numberFmt.format(row.value)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
