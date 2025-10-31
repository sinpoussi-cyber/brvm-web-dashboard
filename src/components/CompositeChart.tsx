// src/components/CompositeChart.tsx
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CompositeChart({ data }: { data: { date: string; value: number }[] }) {
  const chart = data.map(d => ({ date: d.date, value: Number(d.value) }));

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="text-sm font-medium mb-3">BRVM Composite — 20 derniers jours</div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
