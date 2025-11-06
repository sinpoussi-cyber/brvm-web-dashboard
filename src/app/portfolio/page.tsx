// src/app/portfolio/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { fetchQuote, fetchListings } from '@/lib/api';

type Pos = { symbol: string; qty: number; price: number };

export default function PortfolioPage() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [positions, setPositions] = useState<Pos[]>([]);
  const [sym, setSym] = useState('');
  const [qty, setQty] = useState<number>(0);

  useEffect(() => {
    // load listings
    fetchListings().then(r => setSymbols(r.symbols || []));
    // load saved
    const saved = localStorage.getItem('paper_positions');
    if (saved) setPositions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('paper_positions', JSON.stringify(positions));
  }, [positions]);

  async function addPosition() {
    if (!sym || qty <= 0) return;
    const q = await fetchQuote(sym);
    const price = q && typeof q.price === 'number' ? q.price : 0;
    setPositions(p => [...p, { symbol: sym, qty, price }]);
    setQty(0);
  }
  function closePosition(i: number) {
    setPositions(p => p.filter((_, idx) => idx !== i));
  }

  const invested = positions.reduce((acc, p) => acc + p.price * p.qty, 0);
  const estValue = invested; // sans MTM, simple
  const pnl = estValue - invested;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Portefeuille virtuel (paper trading)</h1>

      <div className="rounded-2xl border p-4 bg-white grid md:grid-cols-4 gap-3">
        <select value={sym} onChange={e=>setSym(e.target.value)} className="border rounded-xl px-3 py-2">
          <option value="">— Sélectionner un symbole —</option>
          {symbols.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="number" min={0} value={qty} onChange={e=>setQty(Number(e.target.value))} placeholder="Quantité" className="border rounded-xl px-3 py-2" />
        <button onClick={addPosition} className="rounded-xl bg-black text-white px-3 py-2">Acheter (virtuel)</button>
        <button onClick={()=>setPositions([])} className="rounded-xl border px-3 py-2">Réinitialiser</button>
      </div>

      <div className="rounded-2xl border p-4 bg-white">
        <div className="text-sm font-medium mb-3">Positions</div>
        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">Symbole</th>
                <th className="py-2">Quantité</th>
                <th className="py-2">Prix (achat)</th>
                <th className="py-2">Montant</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 font-medium">{p.symbol}</td>
                  <td className="py-2">{p.qty}</td>
                  <td className="py-2">{p.price.toLocaleString()}</td>
                  <td className="py-2">{(p.price * p.qty).toLocaleString()}</td>
                  <td className="py-2 text-right">
                    <button onClick={()=>closePosition(i)} className="text-red-600 hover:underline">Fermer</button>
                  </td>
                </tr>
              ))}
              {positions.length === 0 && (
                <tr><td colSpan={5} className="py-3 text-gray-500">Aucune position</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-sm text-gray-700">
          Investi: <b>{invested.toLocaleString()}</b> • Valeur estimée: <b>{estValue.toLocaleString()}</b> • P&L: <b>{pnl.toLocaleString()}</b>
        </div>
      </div>
    </div>
  );
}
