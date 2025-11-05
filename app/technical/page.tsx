'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
} from 'recharts';
import {
  fetchCompanies,
  fetchTechnicalSummary,
  fetchCompanySeries,
  type CompanyLite,
  type TechnicalSummary,
  fetchTechnicalGlobalSummary,
} from '@/lib/api';
import Card from '@/components/ui/Card';

type IndicatorData = {
  date: string;
  price?: number;
  mm5?: number;
  mm10?: number;
  mm20?: number;
  mm50?: number;
  rsi?: number;
  macd?: number;
  signal?: number;
  hist?: number;
  bb_upper?: number;
  bb_mid?: number;
  bb_lower?: number;
  stoch_k?: number;
  stoch_d?: number;
};

export default function TechnicalPage() {
  const [companies, setCompanies] = useState<CompanyLite[]>([]);
  const [symbol, setSymbol] = useState('');
  const [data, setData] = useState<IndicatorData[]>([]);
  const [summary, setSummary] = useState<TechnicalSummary | null>(null);
  const [globalSummary, setGlobalSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await fetchCompanies();
      setCompanies(list);
      if (list.length && !symbol) setSymbol(list[0].symbol);
      const global = await fetchTechnicalGlobalSummary();
      setGlobalSummary(global.summary);
    })();
  }, []); // eslint-disable-line

  async function loadTechnical() {
    if (!symbol) return;
    setLoading(true);
    try {
      const [series, tech] = await Promise.all([
        fetchCompanySeries(symbol),
        fetchTechnicalSummary(symbol),
      ]);

      // Fusionner historiques + indicateurs depuis Supabase
      const merged = (series.history ?? []).map((h: any) => ({
        date: h.date,
        price: h.price,
        mm5: h.mm5,
        mm10: h.mm10,
        mm20: h.mm20,
        mm50: h.mm50,
        rsi: h.rsi,
        macd: h.macd,
        signal: h.signal,
        hist: h.hist,
        bb_upper: h.bb_upper,
        bb_mid: h.bb_mid,
        bb_lower: h.bb_lower,
        stoch_k: h.stoch_k,
        stoch_d: h.stoch_d,
      }));
      setData(merged);
      setSummary(tech);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Analyse Technique — BRVM</h1>

      {globalSummary && (
        <Card>
          <div className="font-semibold text-lg mb-1">Résumé global du marché</div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{globalSummary}</p>
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
            onClick={loadTechnical}
            className="h-[46px] px-5 rounded-xl bg-blue-600 text-white font-medium"
            disabled={!symbol || loading}
          >
            {loading ? 'Chargement…' : 'Valider'}
          </button>
        </div>
      </Card>

      {!data.length ? (
        <div className="text-gray-500 text-sm">Sélectionnez une société et cliquez sur <b>Valider</b>.</div>
      ) : (
        <>
          {/* 1️⃣ Cours + Moyennes Mobiles */}
          <Card>
            <div className="font-semibold mb-2">Cours & Moyennes Mobiles (MM5 / MM10 / MM20 / MM50)</div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#000" name="Cours" dot={false} />
                  <Line type="monotone" dataKey="mm5" stroke="#00b894" dot={false} />
                  <Line type="monotone" dataKey="mm10" stroke="#0984e3" dot={false} />
                  <Line type="monotone" dataKey="mm20" stroke="#6c5ce7" dot={false} />
                  <Line type="monotone" dataKey="mm50" stroke="#e17055" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 2️⃣ Bandes de Bollinger */}
          <Card>
            <div className="font-semibold mb-2">Bandes de Bollinger</div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area dataKey="bb_upper" fill="#74b9ff" opacity={0.3} name="Bande Supérieure" />
                  <Area dataKey="bb_mid" fill="#b2bec3" opacity={0.2} name="Bande Centrale" />
                  <Area dataKey="bb_lower" fill="#ff7675" opacity={0.3} name="Bande Inférieure" />
                  <Line dataKey="price" stroke="#2d3436" dot={false} name="Cours" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 3️⃣ MACD */}
          <Card>
            <div className="font-semibold mb-2">MACD</div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line dataKey="macd" stroke="#00b894" name="MACD" dot={false} />
                  <Line dataKey="signal" stroke="#d63031" name="Signal" dot={false} />
                  <Bar dataKey="hist" fill="#b2bec3" name="Histogramme" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 4️⃣ RSI */}
          <Card>
            <div className="font-semibold mb-2">RSI (Relative Strength Index)</div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line dataKey="rsi" stroke="#6c5ce7" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 5️⃣ Stochastique */}
          <Card>
            <div className="font-semibold mb-2">Stochastique (%K et %D)</div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line dataKey="stoch_k" stroke="#0984e3" dot={false} name="%K" />
                  <Line dataKey="stoch_d" stroke="#d63031" dot={false} name="%D" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Résumé global */}
          <Card>
            <div className="font-semibold mb-2">Résumé global</div>
            {!summary ? (
              <div className="text-sm text-gray-500">Clique sur <b>Valider</b> pour voir les signaux.</div>
            ) : (
              <>
                <div className="text-lg font-semibold mb-2">Signal global : {summary.overall}</div>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  {summary.details.map((d, i) => (
                    <li key={i}>
                      <b>{d.name}</b>: {d.decision} {d.value && <span className="text-gray-500">({d.value})</span>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
