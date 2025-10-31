'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import CompanySelect from '@/components/CompanySelect';
import PredictionSummary from '@/components/PredictionSummary';
import Card from '@/components/ui/Card';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function PredictionPage() {
  const [symbol, setSymbol] = useState<string>('');
  const [predData, setPredData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (!symbol) return;
    (async () => {
      const { data: hist, error: e1 } = await supabase.rpc('prediction_history', { sym: symbol });
      const { data: sum, error: e2 } = await supabase.rpc('prediction_summary', { sym: symbol });
      if (!e1 && hist) setPredData(hist);
      if (!e2 && sum && sum.length) setSummary(sum[0]);
    })();
  }, [symbol]);

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Prédictions — Cours des actions BRVM</h1>
      <CompanySelect onSelect={setSymbol} />

      {summary && <PredictionSummary data={summary} />}

      {predData.length > 0 && (
        <Card>
          <div className="text-lg font-semibold mb-2">Évolution : Réel vs Prédit</div>
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={predData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="actual_price" stroke="#2563eb" name="Réel" />
              <Line type="monotone" dataKey="predicted_price" stroke="#16a34a" name="Prédit" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </main>
  );
}
