'use client';
import React from 'react';
import Card from './ui/Card';

export default function RecapTable({ title, data }: { title: string; data: any[] }) {
  return (
    <Card>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left p-2">Société</th>
            <th className="text-right p-2">Dernier cours</th>
            <th className="text-right p-2">Variation (%)</th>
            <th className="text-center p-2">Recommandation</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="p-2">{row.company_name} ({row.symbol})</td>
              <td className="text-right p-2">{row.last_close?.toFixed(2) ?? '—'}</td>
              <td className={`text-right p-2 font-semibold ${
                row.variation_pred > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {row.variation_pred?.toFixed(2) ?? '—'}
              </td>
              <td className="text-center p-2 font-semibold">
                <span className={
                  row.recommendation?.toLowerCase().includes('acheter') ? 'text-green-700' :
                  row.recommendation?.toLowerCase().includes('vendre') ? 'text-red-700' :
                  'text-gray-700'
                }>
                  {row.recommendation ?? '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
