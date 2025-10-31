'use client';
import React from 'react';
import Card from './ui/Card';

type Props = {
  data?: {
    mse?: number;
    rmse?: number;
    r2?: number;
    recommendation?: string;
  };
};

export default function PredictionSummary({ data }: Props) {
  if (!data) return null;

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-2">Performance du modèle</h3>
      <table className="w-full text-sm">
        <tbody>
          <tr><td>MSE</td><td className="text-right font-semibold">{data.mse?.toFixed(4) ?? '—'}</td></tr>
          <tr><td>RMSE</td><td className="text-right font-semibold">{data.rmse?.toFixed(4) ?? '—'}</td></tr>
          <tr><td>R²</td><td className="text-right font-semibold">{data.r2?.toFixed(4) ?? '—'}</td></tr>
        </tbody>
      </table>
      <div className="mt-3 text-center font-semibold text-lg">
        <span className={
          data.recommendation?.toLowerCase().includes('achat') ? 'text-green-600' :
          data.recommendation?.toLowerCase().includes('vente') ? 'text-red-600' :
          'text-gray-700'
        }>
          {data.recommendation ?? ''}
        </span>
      </div>
    </Card>
  );
}
