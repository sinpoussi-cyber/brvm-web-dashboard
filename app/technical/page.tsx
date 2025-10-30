'use client';
import { useEffect, useState } from 'react';
import { fetchIndices10m } from '@/lib/api';
import Card from '@/components/ui/Card';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type IndiceRow = {
  mois: string;
  brvm_composite: number;
  brvm_30: number;
  brvm_prestige: number;
  brvm_croissance: number;
};

const COLORS = {
  composite: '#2563eb', // bleu
  brvm30: '#16a34a',     // vert
  prestige: '#9333ea',   // violet
  croissance: '#f97316', // orange
};

export default function TechnicalIndicesPage() {
  const [data, setData] = useState<IndiceRow[]>([]);
  const [selected, setSelected] = useState<'composite' | 'brvm30' | 'prestige' | 'croissance'>('composite');

  useEffect(() => {
    (async () => {
      const d = await fetchIndices10m();
      setData(d);
    })();
  }, []);

  const titleMap = {
    composite: 'BRVM Composite',
    brvm30: 'BRVM 30',
    prestige: 'BRVM Prestige',
    croissance: 'BRVM Croissance',
  };

  return (
    <div className="space-y-6">
      <div className="text-3xl font-bold">Analyse Technique — Indices BRVM</div>
      <p className="text-gray-600">Évolution moyenne mensuelle sur les 10 derniers mois.</p>

      <div className="flex flex-wrap gap-3">
        {Object.entries(titleMap).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelected(key as any)}
            className={`px-4 py-2 rounded-xl border text-sm transition ${
              selected === key
                ? 'bg-black text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card>
        {data.length === 0 ? (
          <div className="text-center text-gray-500 py-10">Chargement des données...</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" tickFormatter={(m) => m.slice(0, 7)} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              {selected === 'composite' && (
                <Line
                  type="monotone"
                  dataKey="brvm_composite"
                  stroke={COLORS.composite}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="BRVM Composite"
                />
              )}
              {selected === 'brvm30' && (
                <Line
                  type="monotone"
                  dataKey="brvm_30"
                  stroke={COLORS.brvm30}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="BRVM 30"
                />
              )}
              {selected === 'prestige' && (
                <Line
                  type="monotone"
                  dataKey="brvm_prestige"
                  stroke={COLORS.prestige}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="BRVM Prestige"
                />
              )}
              {selected === 'croissance' && (
                <Line
                  type="monotone"
                  dataKey="brvm_croissance"
                  stroke={COLORS.croissance}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="BRVM Croissance"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
