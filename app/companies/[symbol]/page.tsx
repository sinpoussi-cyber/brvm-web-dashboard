'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

interface Company {
  id: number;
  symbol: string;
  name?: string | null;
}

interface ChartPoint {
  date: string;
  actual?: number;
  predicted?: number;
}

interface TechnicalAnalysis {
  symbol: string;
  current_price?: number | null;
  ma20?: number | null;
  ma50?: number | null;
  rsi?: number | null;
  macd?: number | null;
  signal?: number | null;
  histogram?: number | null;
  trend?: string | null;
  trade_date?: string | null;
  rsi_signal?: string | null;
  macd_signal?: string | null;
  ma_signal?: string | null;
  overall_sentiment?: string | null;
}

interface FundamentalMetrics {
  per?: number | null;
  pbr?: number | null;
  roe?: number | null;
  roa?: number | null;
  dividend_yield?: number | null;
  recommendation?: string | null;
  report_date?: string | null;
}

interface RecommendationAdvice {
  recommendation: string;
  recommendation_level?: string;
  score?: number;
  max_score?: number;
  reasons: string[];
  last_update?: string | null;
}

const numberFmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

export default function CompanyDetailsPage() {
  const params = useParams<{ symbol: string }>();
  const symbol = String(params.symbol || '').toUpperCase();
  const [company, setCompany] = useState<Company | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [technical, setTechnical] = useState<TechnicalAnalysis | null>(null);
  const [fundamental, setFundamental] = useState<FundamentalMetrics | null>(null);
  const [advice, setAdvice] = useState<RecommendationAdvice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    async function loadCompany() {
      setLoading(true);
      setError(null);
      try {
        const [historyRes, techRes, recoRes] = await Promise.all([
          fetch(`/api/companies/${symbol}/historical`, { cache: 'no-store' }),
          fetch(`/api/companies/${symbol}/technical-analysis`, { cache: 'no-store' }),
          fetch(`/api/companies/${symbol}/recommendation`, { cache: 'no-store' }),
        ]);

        if (!historyRes.ok) {
          throw new Error('Historique indisponible.');
        }
        const historyPayload = await historyRes.json();
        setCompany(historyPayload.company);
        setChartData(buildChartData(historyPayload.historical ?? [], historyPayload.predictions ?? []));

        if (techRes.ok) {
          const techData = await techRes.json();
          setTechnical(techData);
        } else {
          setTechnical(null);
        }

        if (recoRes.ok) {
          const recommendation = await recoRes.json();
          setFundamental(recommendation.fundamental_data ?? null);
          setAdvice({
            recommendation: recommendation.recommendation,
            recommendation_level: recommendation.recommendation_level,
            score: recommendation.score,
            max_score: recommendation.max_score,
            reasons: recommendation.reasons ?? [],
            last_update: recommendation.last_update,
          });
        } else {
          setFundamental(null);
          setAdvice(null);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? 'Impossible de charger la société.');
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [symbol]);

  const pageTitle = useMemo(() => {
    if (!company) return symbol;
    return `${company.symbol} — ${company.name ?? ''}`.trim();
  }, [company, symbol]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <p className="text-red-600 font-medium">{error}</p>
          <Link href="/companies" className="text-blue-600 mt-4 inline-block">
            ← Retour aux sociétés
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-1">Société cotée</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500">Analyses fondamentales et techniques directement issues de Supabase</p>
          </div>
          <Link
            href="/companies"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50"
          >
            ← Retour aux sociétés
          </Link>
        </div>

        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Cours sur 12 mois</h2>
              <p className="text-sm text-gray-500">Courbe réelle vs. valeurs prédites</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-2"><span className="w-4 h-0.5 bg-blue-600" /> Cours réel</span>
              <span className="inline-flex items-center gap-2"><span className="w-4 h-0.5 bg-amber-500" /> Prévision IA</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { month: 'short' })}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis tickFormatter={(value) => `${Math.round(Number(value)).toLocaleString('fr-FR')}`}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  formatter={(value: number) => `${numberFmt.format(value)} FCFA`}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
                />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} dot={false} name="Cours réel" />
                <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="6 4" name="Prévision" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Analyse technique</h2>
              {technical?.trade_date && (
                <span className="text-xs text-gray-500">
                  MAJ {new Date(technical.trade_date).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
            {technical ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <TechMetric label="Cours" value={technical.current_price} suffix="FCFA" emphasis />
                  <TechMetric label="RSI" value={technical.rsi} suffix=" pts" note={technical.rsi_signal ?? undefined} />
                  <TechMetric label="MACD" value={technical.macd} suffix="" note={technical.macd_signal ?? undefined} />
                  <TechMetric label="Histogramme" value={technical.histogram} suffix="" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <TechMetric label="MA20" value={technical.ma20} suffix=" FCFA" note={technical.ma_signal ?? undefined} />
                  <TechMetric label="MA50" value={technical.ma50} suffix=" FCFA" />
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <p className="text-sm text-gray-500 mb-1">Sentiment global</p>
                  <p className="text-2xl font-semibold text-gray-900">{technical.overall_sentiment ?? '—'}</p>
                  <p className="text-xs text-gray-500">Synthèse RSI • MACD • Moyennes mobiles</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucune donnée technique disponible.</p>
            )}
          </section>

          <section className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Analyse fondamentale</h2>
            {fundamental ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <FundamentalMetric label="PER" value={fundamental.per} />
                <FundamentalMetric label="P/BV" value={fundamental.pbr} />
                <FundamentalMetric label="ROE (%)" value={fundamental.roe} suffix="%" />
                <FundamentalMetric label="ROA (%)" value={fundamental.roa} suffix="%" />
                <FundamentalMetric label="Dividende" value={fundamental.dividend_yield} suffix="%" />
                <div>
                  <p className="text-gray-500">Recommandation</p>
                  <p className="text-lg font-semibold text-gray-900">{fundamental.recommendation ?? '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Dernier rapport</p>
                  <p className="text-sm font-medium text-gray-900">{fundamental.report_date ?? '—'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucun ratio fondamental disponible.</p>
            )}
          </section>
        </div>

        <section className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Conseil en investissement</h2>
              <p className="text-sm text-gray-600">Synthèse combinée des signaux fondamentaux et techniques</p>
            </div>
            {advice?.last_update && (
              <span className="text-xs text-gray-500">MAJ {new Date(advice.last_update).toLocaleDateString('fr-FR')}</span>
            )}
          </div>
          {advice ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-3xl font-bold text-emerald-700">{advice.recommendation}</span>
                {typeof advice.score === 'number' && advice.max_score && (
                  <span className="text-sm text-gray-600">
                    Score {advice.score} / {advice.max_score}
                  </span>
                )}
              </div>
              <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                {advice.reasons && advice.reasons.length > 0
                  ? advice.reasons.map((reason: string, idx: number) => <li key={`reason-${idx}`}>{reason}</li>)
                  : <li>Pas d'explication disponible.</li>}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Les recommandations pour cette valeur seront publiées prochainement.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function buildChartData(historical: any[], predictions: any[]): ChartPoint[] {
  const points = new Map<string, ChartPoint>();
  (historical ?? []).forEach((row: any) => {
    const date = row.trade_date ?? row.date;
    if (!date) return;
    const value = Number(row.close ?? row.price ?? row.latest_price ?? row.value ?? 0);
    if (!Number.isFinite(value)) return;
    const existing = points.get(date) ?? { date };
    existing.actual = value;
    points.set(date, existing);
  });
  (predictions ?? []).forEach((row: any) => {
    const date = row.prediction_date ?? row.date;
    if (!date) return;
    const value = Number(row.predicted_price ?? row.price ?? row.value ?? row.forecast ?? 0);
    if (!Number.isFinite(value)) return;
    const existing = points.get(date) ?? { date };
    existing.predicted = value;
    points.set(date, existing);
  });
  return Array.from(points.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function TechMetric({ label, value, suffix, note, emphasis }: { label: string; value?: number | null; suffix?: string; note?: string; emphasis?: boolean }) {
  return (
    <div className="p-3 rounded-xl bg-gray-50">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-semibold ${emphasis ? 'text-gray-900' : 'text-gray-800'}`}>
        {value !== null && value !== undefined ? `${numberFmt.format(value)}${suffix ?? ''}` : '—'}
      </p>
      {note && <p className="text-xs text-gray-500">{note}</p>}
    </div>
  );
}

function FundamentalMetric({ label, value, suffix }: { label: string; value?: number | null; suffix?: string }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">
        {value !== null && value !== undefined ? `${numberFmt.format(value)}${suffix ?? ''}` : '—'}
      </p>
    </div>
  );
}
