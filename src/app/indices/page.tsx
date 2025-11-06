// src/app/indices/page.tsx
import React from 'react';
import { fetchIndexLast20d, fetchIndexMonthlyAvg10m } from '@/src/lib/supabase';
import LineBlock from '@/components/LineBlock';

async function loadIndex(index: 'composite'|'brvm_30'|'prestige'|'croissance') {
  const [d20, d10m] = await Promise.all([
    fetchIndexLast20d(index),
    fetchIndexMonthlyAvg10m(index),
  ]);
  return { d20, d10m };
}

export default async function IndicesPage({
  searchParams,
}: { searchParams: { idx?: 'composite'|'brvm_30'|'prestige'|'croissance' } }) {
  const idx = searchParams.idx || 'composite';
  const { d20, d10m } = await loadIndex(idx);

  const tabs: { key: 'composite'|'brvm_30'|'prestige'|'croissance'; label: string }[] = [
    { key: 'composite', label: 'Composite' },
    { key: 'brvm_30', label: 'BRVM 30' },
    { key: 'prestige', label: 'Prestige' },
    { key: 'croissance', label: 'Croissance' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Analyse technique — Indices</h1>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <a
            key={t.key}
            href={`/indices?idx=${t.key}`}
            className={`px-3 py-2 rounded-xl text-sm border ${idx === t.key ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}`}
          >
            {t.label}
          </a>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <LineBlock title={`${tabs.find(x=>x.key===idx)?.label} — 20 derniers jours`} data={d20} xKey="date" yKey="value" />
        <LineBlock title={`${tabs.find(x=>x.key===idx)?.label} — Moyenne 10 derniers mois`} data={d10m} xKey="month" yKey="avg_value" />
      </div>
    </div>
  );
}
