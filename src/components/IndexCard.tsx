// src/components/IndexCard.tsx
'use client';

import React from 'react';

export function IndexCard({
  label,
  value,
}: {
  label: string;
  value?: number;
}) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-xl font-semibold">
        {typeof value === 'number' ? value.toLocaleString() : '—'}
      </div>
      <div className="text-xs text-gray-400 mt-1">Dernière valeur</div>
    </div>
  );
}
