'use client';
import React from 'react';
import Card from './ui/Card';

type Data = {
  company_name?: string;
  per?: number;
  pbr?: number;
  roe?: number;
  roa?: number;
  dividend_yield?: number;
  recommendation?: string;
  summary?: string;
  report_date?: string;
};

export default function FundamentalsTable({ data }: { data?: Data }) {
  if (!data) return <div className="text-gray-500">Aucune donnée disponible</div>;

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-2">{data.company_name}</h3>
      <div className="text-sm text-gray-500 mb-4">
        Dernier rapport : {data.report_date ? new Date(data.report_date).toLocaleDateString() : '—'}
      </div>
      <table className="w-full text-sm border-collapse">
        <tbody>
          <tr><td>PER</td><td className="text-right font-semibold">{data.per ?? '—'}</td></tr>
          <tr><td>PBR</td><td className="text-right font-semibold">{data.pbr ?? '—'}</td></tr>
          <tr><td>ROE (%)</td><td className="text-right font-semibold">{data.roe ?? '—'}</td></tr>
          <tr><td>ROA (%)</td><td className="text-right font-semibold">{data.roa ?? '—'}</td></tr>
          <tr><td>Dividende (%)</td><td className="text-right font-semibold">{data.dividend_yield ?? '—'}</td></tr>
        </tbody>
      </table>
      <div className="mt-4">
        <div className="font-semibold">Recommandation :</div>
        <div className={`text-lg ${
          data.recommendation?.toLowerCase().includes('acheter') ? 'text-green-600' :
          data.recommendation?.toLowerCase().includes('vendre') ? 'text-red-600' :
          'text-gray-700'
        }`}>
          {data.recommendation ?? '—'}
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-700 italic">{data.summary ?? ''}</div>
    </Card>
  );
}
