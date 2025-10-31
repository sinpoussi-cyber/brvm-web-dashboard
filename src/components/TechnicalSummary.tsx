'use client';
import React from 'react';
import Card from './ui/Card';

type Props = {
  data?: {
    last_close?: number;
    current_rsi?: number;
    current_macd?: number;
    signal_macd?: number;
    histogram?: number;
    trend?: string;
    recommendation?: string;
  };
};

export default function TechnicalSummary({ data }: Props) {
  if (!data) return null;

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-2">Résumé technique</h3>
      <table className="w-full text-sm">
        <tbody>
          <tr><td>Dernier cours</td><td className="text-right font-semibold">{data.last_close ?? '—'}</td></tr>
          <tr><td>RSI</td><td className="text-right font-semibold">{data.current_rsi?.toFixed(2) ?? '—'}</td></tr>
          <tr><td>MACD</td><td className="text-right font-semibold">{data.current_macd?.toFixed(2) ?? '—'}</td></tr>
          <tr><td>Signal MACD</td><td className="text-right font-semibold">{data.signal_macd?.toFixed(2) ?? '—'}</td></tr>
          <tr><td>Histogramme</td><td className="text-right font-semibold">{data.histogram?.toFixed(2) ?? '—'}</td></tr>
          <tr><td>Tendance</td><td className="text-right">{data.trend ?? '—'}</td></tr>
        </tbody>
      </table>
      <div className="mt-3 font-semibold text-center text-lg">
        <span className={
          data.recommendation?.toLowerCase().includes('acheter') ? 'text-green-600' :
          data.recommendation?.toLowerCase().includes('vendre') ? 'text-red-600' :
          'text-gray-700'
        }>
          {data.recommendation ?? ''}
        </span>
      </div>
    </Card>
  );
}
