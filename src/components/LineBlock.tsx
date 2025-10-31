'use client';
import React from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function LineBlock({
  title,
  data,
  xKey,
  yKey,
  height = 280,
}: {
  title: string;
  data: any[];
  xKey: string;
  yKey: string;
  height?: number;
}) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="text-sm font-medium mb-3">{title}</div>
      <div className="h-[280px]" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey={yKey} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
