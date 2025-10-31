'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import CompanySelect from '@/components/CompanySelect';
import FundamentalsTable from '@/components/FundamentalsTable';
import Card from '@/components/ui/Card';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function FundamentalCompaniesPage() {
  const [symbol, setSymbol] = useState<string>('');
  const [details, setDetails] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!symbol) return;
    (async () => {
      const { data: info, error } = await supabase.rpc('fundamental_by_symbol', { sym: symbol });
      if (!error && info && info.length) setDetails(info[0]);
      const { data: hist } = await supabase.rpc('fundamental_history', { sym: symbol });
      setHistory(hist || []);
    })();
  }, [symbol]);

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Analyse Fondamentale — Sociétés cotées</h1>
      <CompanySelect onSelect={setSymbol} />

      {details && <FundamentalsTable data={details} />}

      {history.length > 0 && (
        <Card>
          <div className="text-lg font-semibold mb-2">Historique des ratios</div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="report_date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="per" stroke="#2563eb" name="PER" />
              <Line type="monotone" dataKey="pbr" stroke="#16a34a" name="PBR" />
              <Line type="monotone" dataKey="roe" stroke="#f59e0b" name="ROE" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </main>
  );
}
