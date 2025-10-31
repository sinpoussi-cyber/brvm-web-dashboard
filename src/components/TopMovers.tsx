// src/components/TopMovers.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { fetchTopGainers, fetchTopLosers } from '@/src/lib/api';

type Item = { symbol: string; latest_price: number; change_percent: number };

export default function TopMovers() {
  const [gainers, setGainers] = useState<Item[]>([]);
  const [losers, setLosers] = useState<Item[]>([]);
  const [err, setErr] = useState<string|undefined>();

  useEffect(() => {
    (async () => {
      try {
        const [g, l] = await Promise.all([fetchTopGainers(), fetchTopLosers()]);
        setGainers(g.data || []);
        setLosers(l.data || []);
      } catch (e: any) {
        setErr('Impossible de charger les tops (API backend).');
      }
    })();
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-2xl p-4 shadow bg-white">
        <div className="text-lg font-semibold">Top 10 Gagnants</div>
        <div className="divide-y mt-2">
          {gainers.map((it, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <span className="font-medium">{it.symbol}</span>
              <span className="text-gray-500">{it.latest_price}</span>
              <span className="text-green-600">+{it.change_percent}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-4 shadow bg-white">
        <div className="text-lg font-semibold">Top 10 Perdants</div>
        <div className="divide-y mt-2">
          {losers.map((it, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <span className="font-medium">{it.symbol}</span>
              <span className="text-gray-500">{it.latest_price}</span>
              <span className="text-red-600">{it.change_percent}%</span>
            </div>
          ))}
        </div>
      </div>
      {err && <div className="md:col-span-2 text-sm text-red-600">{err}</div>}
    </div>
  );
}
