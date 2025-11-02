'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  fetchCompanies,
  fetchCompanySeries,
  fetchTechnicalSummary,
  fetchFundamentalSummary,
  type CompanyLite,
  type TechnicalSummary,
  type FundamentalSummary,
} from '@/lib/api';
import Card from '@/components/ui/Card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';

type MergedRow = { date: string; price?: number; kind: 'Historique' | 'Prévision'; lower?: number; upper?: number };

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyLite[]>([]);
  const [symbol, setSymbol] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [series, setSeries] = useState<{ history: any[]; forecast: any[]; last: any } | null>(null);
  const [tech, setTech] = useState<TechnicalSummary | null>(null);
  const [fund, setFund] = useState<FundamentalSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Charger liste des sociétés
  useEffect(() => {
    (async () => {
      const list = await fetchCompanies();
      setCompanies(list);
      if (list.length && !symbol) setSymbol(list[0].symbol);
    })();
  }, []); // eslint-disable-line

  // Valider et charger les blocs
  async function onValidate() {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const [s, t, f] = await Promise.all([
        fetchCompanySeries(symbol),
        fetchTechnicalSummary(symbol),
        fetchFundamentalSummary(symbol),
      ]);
      setSeries(s);
      setTech(t);
      setFund(f);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }

  const merged: MergedRow[] = useMemo(() => {
    if (!series) return [];
    const h = (series.history ?? []).map((r: any) => ({ date: r.date, price: r.price, kind: 'Historique' as const }));
    const f = (series.forecast ?? []).map((r: any) => ({ date: r.date, price: r.price, kind: 'Prévision' as const, lower: r.lower, upper: r.upper }));
    return [...h, ...f];
  }, [series]);

  // Conseil d'investissement simplifié (agrégation Tech + Fund)
  const advice = useMemo(() => {
    const techOverall = tech?.overall ?? 'Indisponible';
    const txt = (fund?.summary || '').toLowerCase();
    const pos = /croissance|amélioration|bénéfice|rentabilité|progression|dividende/.test(txt);
    const neg = /baisse|diminution|perte|dégradation|risque/.test(txt);

    let reco: 'Acheter' | 'Conserver' | 'Vendre' = 'Conserver';
    if (techOverall === 'Achat' && pos && !neg) reco = 'Acheter';
    else if (techOverall === 'Vente' && neg && !pos) reco = 'Vendre';

    const reasons = [
      `Technique: ${techOverall}`,
      pos ? 'Fondamental: Signal positif détecté' : neg ? 'Fondamental: Signal négatif détecté' : 'Fondamental: neutre / insuffisant',
    ];

    return { reco, reasons };
  }, [tech, fund]);

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sociétés cotées — Fiche d’analyse</h1>
      </div>

      {/* Sélecteur + Bouton */}
      <Card>
        <div className="grid md:grid-cols-[1fr_auto] gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Choisir une société</label>
            <select
              className="w-full border rounded-xl p-3"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            >
              {companies.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.symbol} {c.name ? `— ${c.name}` : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={onValidate}
            className="h-[46px] px-5 rounded-xl bg-blue-600 text-white font-medium"
            disabled={!symbol || loading}
          >
            {loading ? 'Chargement…' : 'Valider'}
          </button>
        </div>
      </Card>

      {/* Graphique Historique + Prévision */}
      <Card>
        <div className="text-lg font-semibold mb-3">
          Cours — Historique & Prévisions {symbol ? `(${symbol})` : ''}
        </div>

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        {merged.length === 0 ? (
          <div className="text-sm text-gray-500">Sélectionnez une société puis cliquez sur <b>Valider</b>.</div>
        ) : (
          <div style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={merged}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="price" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bande de confiance prévision (si lower/upper) */}
        {!!(series?.forecast?.length && series.forecast.some((x: any) => x.lower != null && x.upper != null)) && (
          <div className="mt-4" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series!.forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area dataKey="upper" type="monotone" dot={false} opacity={0.2} />
                <Area dataKey="lower" type="monotone" dot={false} opacity={0.2} />
                <Line dataKey="price" type="monotone" dot={false} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Volume & Valeur (dernière séance) */}
        {series?.last && (
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="rounded-2xl border p-4 bg-white">
              <div className="text-sm text-gray-500">Dernière séance</div>
              <div className="text-xs text-gray-400">{series.last.date}</div>
            </div>
            <div className="rounded-2xl border p-4 bg-white">
              <div className="text-sm text-gray-500">Volume</div>
              <div className="text-xl font-semibold">{(series.last.volume ?? 0).toLocaleString()}</div>
            </div>
            <div className="rounded-2xl border p-4 bg-white">
              <div className="text-sm text-gray-500">Valeur (FCFA)</div>
              <div className="text-xl font-semibold">{(series.last.traded_value ?? 0).toLocaleString()}</div>
            </div>
          </div>
        )}
      </Card>

      {/* Analyse Technique + Fondamentale */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="text-lg font-semibold mb-2">Analyse technique</div>
          {!tech ? (
            <div className="text-sm text-gray-500">Clique sur <b>Valider</b> pour charger.</div>
          ) : (
            <>
              <div className="mb-2 text-sm">Synthèse: <b>{tech.overall}</b></div>
              <ul className="text-sm list-disc ml-5 space-y-1">
                {tech.details.map((d, i) => (
                  <li key={i}>
                    <b>{d.name}</b>: {d.decision} {d.value ? <span className="text-gray-500">({d.value})</span> : null}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card>
          <div className="text-lg font-semibold mb-2">Analyse fondamentale</div>
          {!fund ? (
            <div className="text-sm text-gray-500">Clique sur <b>Valider</b> pour charger.</div>
          ) : (
            <>
              <div className="text-sm whitespace-pre-wrap">{fund.summary}</div>
              {fund.last_report?.url && (
                <a
                  className="text-blue-600 text-sm inline-block mt-2"
                  href={fund.last_report.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ouvrir le dernier rapport
                </a>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Conseil d’Investissement */}
      <Card>
        <div className="text-lg font-semibold mb-2">Conseil d’Investissement</div>
        {!series || !tech || !fund ? (
          <div className="text-sm text-gray-500">Clique sur <b>Valider</b> pour générer une recommandation.</div>
        ) : (
          <>
            <div className="text-xl font-semibold mb-2">
              {advice.reco === 'Acheter' && <span className="text-green-600">Acheter</span>}
              {advice.reco === 'Conserver' && <span className="text-amber-600">Conserver</span>}
              {advice.reco === 'Vendre' && <span className="text-red-600">Vendre</span>}
            </div>
            <ul className="text-sm list-disc ml-5 space-y-1">
              {advice.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
