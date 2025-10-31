// src/components/StatsCards.tsx
'use client';

import React from 'react';

type Props = {
  lastDate?: string;
  totalCompanies?: number;
  cap?: number;
  vol?: number;
  val?: number;
  ytdComposite?: number;
};

function K(v?: number) {
  if (v === undefined || v === null) return '—';
  if (v >= 1_000_000_000) return (v/1_000_000_000).toFixed(2)+' Md';
  if (v >= 1_000_000) return (v/1_000_000).toFixed(2)+' M';
  if (v >= 1_000) return (v/1_000).toFixed(2)+' k';
  return v.toFixed(0);
}

export default function StatsCards({
  lastDate, totalCompanies, cap, vol, val, ytdComposite
}: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="rounded-2xl p-4 shadow bg-white">
        <div className="text-sm text-gray-500">Dernière date (Supabase)</div>
        <div className="text-xl font-semibold">{lastDate || '—'}</div>
        <div className="mt-1 text-sm text-gray-500">Sociétés cotées</div>
        <div className="text-lg">{totalCompanies ?? '—'}</div>
      </div>
      <div className="rounded-2xl p-4 shadow bg-white">
        <div className="text-sm text-gray-500">Capitalisation Globale</div>
        <div className="text-xl font-semibold">{K(cap)}</div>
        <div className="mt-1 text-sm text-gray-500">YTD Composite</div>
        <div className={`text-lg ${ytdComposite && ytdComposite>=0 ? 'text-green-600' : 'text-red-600'}`}>
          {ytdComposite !== undefined ? `${ytdComposite.toFixed(2)} %` : '—'}
        </div>
      </div>
      <div className="rounded-2xl p-4 shadow bg-white">
        <div className="text-sm text-gray-500">Volume / Valeur (annuels moyens)</div>
        <div className="text-xl font-semibold">{K(vol)} / {K(val)}</div>
      </div>
    </div>
  );
}
