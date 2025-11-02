'use client';

import { useEffect, useState } from 'react';
import {
  fetchCompanies,
  fetchFundamentalSummary,
  type CompanyLite,
  type FundamentalSummary,
} from '@/lib/api';
import Card from '@/components/ui/Card';

type FinancialMetrics = {
  revenue?: number;
  profit?: number;
  eps?: number;
  pe_ratio?: number;
  pb_ratio?: number;
  dividend_yield?: number;
  roa?: number;
  roe?: number;
  debt_ratio?: number;
  market_cap?: number;
  report_date?: string;
};

export default function FundamentalPage() {
  const [companies, setCompanies] = useState<CompanyLite[]>([]);
  const [symbol, setSymbol] = useState('');
  const [summary, setSummary] = useState<FundamentalSummary | null>(null);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await fetchCompanies();
      setCompanies(list);
      if (list.length && !symbol) setSymbol(list[0].symbol);
    })();
  }, []); // eslint-disable-line

  async function loadFundamentals() {
    if (!symbol) return;
    setLoading(true);
    try {
      const fund = await fetchFundamentalSummary(symbol);
      setSummary(fund);

      // Récupération Supabase (ratios financiers)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/fundamentals/metrics/${encodeURIComponent(symbol)}`
      );
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      } else {
        setMetrics(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Analyse Fondamentale — BRVM</h1>

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
        <div className="text-gray-500 text-sm">Sélectionnez une société et cliquez sur <b>Valider</b>.</div>
      ) : (
        <>
          {/* Résumé analytique */}
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

          {/* Ratios financiers */}
          {metrics && (
            <Card>
              <div className="font-semibold text-lg mb-2">Ratios financiers clés</div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Chiffre d'affaires</p>
                  <p className="text-lg font-semibold">{metrics.revenue?.toLocaleString() ?? '—'} FCFA</p>
                </div>
                <div>
                  <p className="text-gray-500">Résultat net</p>
                  <p className="text-lg font-semibold">{metrics.profit?.toLocaleString() ?? '—'} FCFA</p>
                </div>
                <div>
                  <p className="text-gray-500">EPS (Bénéfice par action)</p>
                  <p className="text-lg font-semibold">{metrics.eps?.toFixed(2) ?? '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">PER (Price/Earnings)</p>
                  <p className="text-lg font-semibold">{metrics.pe_ratio?.toFixed(2) ?? '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">PBV (Price/Book)</p>
                  <p className="text-lg font-semibold">{metrics.pb_ratio?.toFixed(2) ?? '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Rendement du dividende</p>
                  <p className="text-lg font-semibold">{metrics.dividend_yield?.toFixed(2) ?? '—'} %</p>
                </div>
                <div>
                  <p className="text-gray-500">ROA (Rentabilité des actifs)</p>
                  <p className="text-lg font-semibold">{metrics.roa?.toFixed(2) ?? '—'} %</p>
                </div>
                <div>
                  <p className="text-gray-500">ROE (Rentabilité des capitaux propres)</p>
                  <p className="text-lg font-semibold">{metrics.roe?.toFixed(2) ?? '—'} %</p>
                </div>
                <div>
                  <p className="text-gray-500">Ratio d'endettement</p>
                  <p className="text-lg font-semibold">{metrics.debt_ratio?.toFixed(2) ?? '—'} %</p>
                </div>
                <div>
                  <p className="text-gray-500">Capitalisation boursière</p>
                  <p className="text-lg font-semibold">{metrics.market_cap?.toLocaleString() ?? '—'} FCFA</p>
                </div>
                <div>
                  <p className="text-gray-500">Date du rapport</p>
                  <p className="text-lg font-semibold">{metrics.report_date ?? '—'}</p>
                </div>
              </div>
            </Card>
          )}

          {!metrics && (
            <Card>
              <div className="text-gray-500 text-sm">Aucun ratio financier disponible pour cette société.</div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
