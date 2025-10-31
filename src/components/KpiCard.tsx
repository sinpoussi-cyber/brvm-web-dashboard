// src/components/KpiCard.tsx
import React from 'react';

export function KpiCard({
  title,
  value,
  sub,
}: {
  title: string;
  value?: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">
        {value ?? '—'}
      </div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}
