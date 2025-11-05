'use client';

import { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import LineBlock from '@/components/charts/LineBlock';
import {
  fetchCompanies,
  fetchCompanySeries,
  fetchFundamentalSummary,
  fetchFundamentalMetrics,
  fetchTechnicalSummary,
  type CompanyLite,
  type CompanySeries,
  type TechnicalSummary,
  type FundamentalSummary,
  type FundamentalMetrics,
} from '@/lib/api';

const numberFmt = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 2,
});

const percentFmt = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 2,
});

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyLite[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [series, setSeries] = useState<CompanySeries | null>(null);
  const [technical, setTechnical] = useState<TechnicalSummary | null>(null);
  const [fundamental, setFundamental] = useState<FundamentalSummary | null>(null);
  const [metrics, setMetrics] = useState<FundamentalMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
  (async () => {
      const list = await fetchCompanies();
      setCompanies(list);
      if (list.length && !selected) setSelected(list[0].symbol);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = useMemo(() => {
    if (!series) return [] as Array<Record<string, any>>;
    const map = new Map<string, { date: string; Historique?: number; Prévision?: number }>();
    series.history.forEach((point) => {
      if (!point.date) return;
      const entry = map.get(point.date) ?? { date: point.date };
      entry.Historique = point.price;
      map.set(point.date, entry);
    });
    series.forecast.forEach((point) => {
      if (!point.date) return;
      const entry = map.get(point.date) ?? { date: point.date };
      entry.Prévision = point.price;
      map.set(point.date, entry);
    });
    return Array.from(map.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [series]);

  const advice = useMemo(() => {
    const techSignal = technical?.overall ?? '';
    const fundText = fundamental?.summary ?? '';
    if (!techSignal && !fundText) {
      return 'Sélectionnez une société pour afficher les recommandations.';
    }
    if (/achat/i.test(techSignal) || /achat/i.test(fundText)) {
      return '👉 Conseil : Acheter (signaux majoritairement positifs)';
    }
    if (/vente/i.test(techSignal) || /vente/i.test(fundText)) {
      return '⚠️ Conseil : Vendre (risques identifiés sur le titre)';
    }
    if (/conserver/i.test(fundText) || /neutre/i.test(techSignal)) {
      return '🤝 Conseil : Conserver (situation équilibrée)';
    }
    return 'ℹ️ Conseil : Attendre des signaux supplémentaires.';
  }, [technical, fundamental]);

  async function loadCompanyData() {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const [serieData, tech, fund, ratios] = await Promise.all([
        fetchCompanySeries(selected),
        fetchTechnicalSummary(selected),
        fetchFundamentalSummary(selected),
        fetchFundamentalMetrics(selected),
      ]);
      setSeries(serieData);
      setTechnical(tech);
      setFundamental(fund);
      setMetrics(ratios);
    } catch (err) {
      console.error(err);
      setError('Impossible de récupérer les données pour cette société.');
      setSeries(null);
      setTechnical(null);
      setFundamental(null);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold mb-4">Sociétés cotées à la BRVM</h1>
        <div className="flex flex-wrap gap-3">
          <select
            className="border rounded-lg p-2 flex-1 min-w-[220px]"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {companies.map((company) => (
              <option key={company.symbol} value={company.symbol}>
                {company.symbol} — {company.name ?? '—'}
              </option>
            ))}
          </select>
          <button
            onClick={loadCompanyData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            disabled={!selected || loading}
          >
            {loading ? 'Chargement…' : 'Valider'}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </Card>

      {chartData.length > 0 && (
        <LineBlock
          title={`Cours ${selected} — Historique & Prévisions`}
          data={chartData}
          xKey="date"
          lines={[
            { dataKey: 'Historique', name: 'Historique', color: '#2563eb' },
            { dataKey: 'Prévision', name: 'Prévision', color: '#f97316' },
          ]}
        />
      )}

      {series?.last && (
        <Card>
          <h2 className="text-lg font-semibold mb-2">Volumes & Valeurs de transaction</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Dernière séance</p>
              <p className="font-semibold">{series.last.date ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Volume échangé</p>
              <p className="font-semibold text-blue-700">
                {series.last.volume !== undefined ? numberFmt.format(series.last.volume) : '—'} titres
              </p>
            </div>
            <div>
              <p className="text-gray-500">Valeur des transactions</p>
              <p className="font-semibold text-blue-700">
                {series.last.traded_value !== undefined
                  ? `${numberFmt.format(series.last.traded_value)} FCFA`
                  : '—'}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold mb-2">Analyse technique</h2>
           {technical ? (
            <>
              <div className="text-sm font-semibold mb-2">Signal global : {technical.overall}</div>
              <ul className="list-disc ml-5 text-sm space-y-1">
                {technical.details.map((detail, index) => (
                  <li key={`${detail.name}-${index}`}>
                    <b>{detail.name}</b> — {detail.decision}
                    {detail.value && <span className="text-gray-500"> ({detail.value})</span>}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-gray-500">Cliquez sur valider pour afficher les données techniques.</p>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">Analyse fondamentale</h2>
          {fundamental ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{fundamental.summary}</p>
          ) : (
            <p className="text-sm text-gray-500">Cliquez sur valider pour afficher l’analyse fondamentale.</p>
          )}
        </Card>
      </div>

      {metrics && (
        <Card>
          <h2 className="font-semibold mb-3">Ratios fondamentaux</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">PER</p>
              <p className="text-lg font-semibold">
                {metrics.per !== undefined ? metrics.per.toFixed(2) : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">P/BV</p>
              <p className="text-lg font-semibold">
                {metrics.pbr !== undefined ? metrics.pbr.toFixed(2) : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Dividende (%)</p>
              <p className="text-lg font-semibold">
                {metrics.dividend_yield !== undefined
                  ? percentFmt.format(metrics.dividend_yield)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">ROA</p>
              <p className="text-lg font-semibold">
                {metrics.roa !== undefined ? `${percentFmt.format(metrics.roa)} %` : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">ROE</p>
              <p className="text-lg font-semibold">
                {metrics.roe !== undefined ? `${percentFmt.format(metrics.roe)} %` : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Recommandation</p>
              <p className="text-lg font-semibold">{metrics.recommendation ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Date du rapport</p>
              <p className="text-lg font-semibold">{metrics.report_date ?? '—'}</p>
            </div>
            <div className="md:col-span-3">
              <p className="text-gray-500">Résumé</p>
              <p className="text-sm leading-relaxed">{metrics.summary ?? '—'}</p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="font-semibold mb-2">Conseil d’investissement</h2>
        <p className="text-base font-medium">{advice}</p>
      </Card>
    </div>
  );
}
