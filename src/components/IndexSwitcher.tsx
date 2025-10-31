// src/components/IndexSwitcher.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { getIndexSeries20d, getIndexSeries10m } from '@/src/lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

type IndexKey = 'composite' | 'brvm30' | 'prestige' | 'croissance';

const labels: Record<IndexKey, string> = {
  composite: 'BRVM Composite',
  brvm30: 'BRVM 30',
  prestige: 'BRVM Prestige',
  croissance: 'BRVM Croissance'
};

export default function IndexSwitcher() {
  const [idx, setIdx] = useState<IndexKey>('composite');
  const [d20, setD20] = useState<{ d: string; v: number }[] | null>(null);
  const [m10, setM10] = useState<{ mois: string; moyenne: number }[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(k: IndexKey) {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        getIndexSeries20d(k),
        getIndexSeries10m(k)
      ]);
      setD20(a);
      setM10(b);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(idx);
  }, [idx]);

  return (
    <div className="rounded-2xl p-4 shadow bg-white">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-semibold">Indices — {labels[idx]}</h3>
        <div className="flex gap-2">
          {(['composite','brvm30','prestige','croissance'] as IndexKey[]).map(k => (
            <button
              key={k}
              onClick={() => setIdx(k)}
              className={`px-3 py-1 rounded-full border text-sm ${idx===k ? 'bg-black text-white' : 'bg-white'}`}
            >
              {labels[k].split(' ')[1] ? labels[k] : labels[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="h-64">
          <div className="text-sm text-gray-500 mb-2">Évolution (20 jours)</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={d20 || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="d" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="v" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-64">
          <div className="text-sm text-gray-500 mb-2">Moyenne mensuelle (10 derniers mois)</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={(m10 || []).map(r => ({ ...r, label: r.mois?.slice(0,7) }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="moyenne" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {loading && <div className="mt-2 text-sm text-gray-500">Chargement…</div>}
    </div>
  );
}
