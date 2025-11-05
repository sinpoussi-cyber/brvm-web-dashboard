'use client';

import { useEffect, useState } from 'react';
import {
  fetchCompanies,
  fetchFundamentalSummary,
  fetchFundamentalGlobalSummary,
  fetchFundamentalMetrics,
  fetchFundamentalLeaders,
  type CompanyLite,
  type FundamentalSummary,
  type FundamentalMetrics,
} from '@/lib/api';
import Card from '@/components/ui/Card';

const percentFmt = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 2,
});

export default function FundamentalPage() {
  const [companies, setCompanies] = useState<CompanyLite[]>([]);
  const [symbol, setSymbol] = useState('');
  const [summary, setSummary] = useState<FundamentalSummary | null>(null);
  const [metrics, setMetrics] = useState<FundamentalMetrics | null>(null);
  const [globalSummary, setGlobalSummary] = useState('');
  const [leaders, setLeaders] = useState<FundamentalMetrics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await fetchCompanies();
      setCompanies(list);
      if (list.length && !symbol) setSymbol(list[0].symbol);

      const [global, top] = await Promise.all([
        fetchFundamentalGlobalSummary(),
        fetchFundamentalLeaders(12),
      ]);
      setGlobalSummary(global.summary);
      setLeaders(top ?? []);
    })();
  }, []); // eslint-disable-line

  async function loadFundamentals() {
    if (!symbol) return;
    setLoading(true);
    try {
      const fund = await fetchFundamentalSummary(symbol);
      setSummary(fund);
      const ratios = await fetchFundamentalMetrics(symbol);
      setMetrics(ratios);
    } catch (error) {
      console.error(error);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Analyse Fondamentale — BRVM</h1>

      {globalSummary && (
        <Card>
          <div className="font-semibold text-lg mb-2">Résumé global</div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{globalSummary}</p>
        </Card>
      )}

      {/* Sélecteur société */}
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
            onClick={loadFundamentals}
            className="h-[46px] px-5 rounded-xl bg-blue-600 text-white font-medium"
            disabled={!symbol || loading}
          >
            {loading ? 'Chargement…' : 'Valider'}
          </button>
        </div>
      </Card>

      {!summary ? (
        <div className="text-gray-500 text-sm">
          Sélectionnez une société et cliquez sur <b>Valider</b>.
        </div>
      ) : (
        <>
          <Card>
            <div className="font-semibold text-lg mb-2">Résumé analytique</div>
            <div className="text-sm whitespace-pre-wrap">{summary.summary}</div>
            {summary.last_report?.url && (
              <a
                href={summary.last_report.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 text-sm mt-2 inline-block"
              >
                Consulter le dernier rapport financier
              </a>
            )}
          </Card>

          {metrics ? (
            <Card>
              <div className="font-semibold text-lg mb-2">Ratios financiers clés</div>
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
          ) : (
            <Card>
              <div className="text-gray-500 text-sm">
                Aucun ratio financier disponible pour cette société.
              </div>
            </Card>
          )}
        </>
      )}

      {leaders.length > 0 && (
        <Card>
          <div className="font-semibold text-lg mb-3">Tableau de bord fondamental</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Symbole</th>
                  <th className="p-2 text-left">Société</th>
                  <th className="p-2 text-right">PER</th>
                  <th className="p-2 text-right">P/BV</th>
                  <th className="p-2 text-right">ROE</th>
                  <th className="p-2 text-right">Dividende</th>
                  <th className="p-2 text-left">Reco.</th>
                  <th className="p-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((row) => (
                  <tr key={`leader-${row.symbol}`} className="border-b">
                    <td className="p-2 font-semibold">{row.symbol}</td>
                    <td className="p-2">{row.company_name ?? '—'}</td>
                    <td className="p-2 text-right">{row.per !== undefined ? row.per.toFixed(2) : '—'}</td>
                    <td className="p-2 text-right">{row.pbr !== undefined ? row.pbr.toFixed(2) : '—'}</td>
                    <td className="p-2 text-right">
                      {row.roe !== undefined ? `${percentFmt.format(row.roe)} %` : '—'}
                    </td>
                    <td className="p-2 text-right">
                      {row.dividend_yield !== undefined ? `${percentFmt.format(row.dividend_yield)} %` : '—'}
                    </td>
                    <td className="p-2">{row.recommendation ?? row.summary ?? '—'}</td>
                    <td className="p-2">{row.report_date ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
