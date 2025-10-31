'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import RecapTable from '@/components/RecapTable';
import RecapSummaryChart from '@/components/RecapSummaryChart';

export default function RecapitulatifPage() {
  const [buy, setBuy] = useState<any[]>([]);
  const [sell, setSell] = useState<any[]>([]);
  const [all, setAll] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: b } = await supabase.rpc('top_10_buy');
      const { data: s } = await supabase.rpc('top_10_sell');
      const { data: a } = await supabase.rpc('recap_all');
      setBuy(b || []);
      setSell(s || []);
      setAll(a || []);
    })();
  }, []);

  return (
    <main className="max-w-7xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Résumé global — Actions à acheter ou à éviter</h1>

      <RecapSummaryChart data={all} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecapTable title="Top 10 — À Acheter" data={buy} />
        <RecapTable title="Top 10 — À Vendre" data={sell} />
      </div>

      <RecapTable title="Vue d’ensemble — Toutes les actions" data={all} />
    </main>
  );
}
