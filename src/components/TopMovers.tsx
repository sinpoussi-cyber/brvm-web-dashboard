// src/components/TopMovers.tsx
'use client';

import React from 'react';
import type { TopMove } from '@/types';

function Table({ rows, title }: { rows: TopMove[]; title: string }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="text-sm font-medium mb-3">{title}</div>
      <div className="overflow-x-auto">
        <table className="min-w-[400px] w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Symbole</th>
              <th className="py-2">Cours</th>
              <th className="py-2">Variation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.symbol} className="border-t">
                <td className="py-2 font-medium">{r.symbol}</td>
                <td className="py-2">{r.latest_price.toLocaleString()}</td>
                <td className={`py-2 font-semibold ${r.change_percent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {r.change_percent.toFixed(2)}%
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="py-4 text-gray-400" colSpan={3}>Aucune donnée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TopMovers({
  gainers,
  losers,
}: {
  gainers: TopMove[];
  losers: TopMove[];
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Table rows={gainers} title="Top 10 Hausse" />
      <Table rows={losers} title="Top 10 Baisse" />
    </div>
  );
}
