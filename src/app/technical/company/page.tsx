'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import CompanySelect from '@/components/CompanySelect';
import TechnicalSummary from '@/components/TechnicalSummary';
import Card from '@/components/ui/Card';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function TechnicalCompanyPage() {
  const [symbol, setSymbol] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (!symbol) return;
    (async () => {
      const { data: hist, error: e1 } = await supabase.rpc('technical_history', { sym: symbol });
      const { data: sum, error: e2 } = await supabase.rpc('technical_summary', { sym: symbol });
      if (!e1 && hist) setHistory(hist);
      if (!e2 && sum && sum.length) setSummary(sum[0]);
    })();
  }, [symbol]);

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Analyse Technique — Société</h1>
      <CompanySelect onSelect={setSymbol} />

      {summary && <TechnicalSummary data={summary} />}

      {history.length > 0 && (
        <Card>
          <div className="text-lg font-semibold mb-2">Graphique de prix et moyennes mobiles</div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="trade_date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="close_price" stroke="#1e40af" name="Cours" />
              <Line type="monotone" dataKey="ma20" stroke="#16a34a" name="MA20" />
              <Line type="monotone" dataKey="ma50" stroke="#f59e0b" name="MA50" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <div className="text-lg font-semibold mb-2">RSI et MACD</div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="trade_date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rsi" stroke="#dc2626" name="RSI" />
              <Line type="monotone" dataKey="macd" stroke="#2563eb" name="MACD" />
              <Line type="monotone" dataKey="signal" stroke="#f59e0b" name="Signal MACD" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </main>
  );
}
