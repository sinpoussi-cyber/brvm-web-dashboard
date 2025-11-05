'use client';

import { useEffect, useState } from 'react';
import {
  fetchCompanies,
  fetchCompanyQuote,
  type CompanyLite,
} from '@/lib/api';
import Card from '@/components/ui/Card';

type Holding = {
  symbol: string;
  name?: string;
  quantity: number;
  buyPrice: number;
  currentPrice?: number;
};

export default function TrainingPage() {
  const [companies, setCompanies] = useState<CompanyLite[]>([]);
  const [budget, setBudget] = useState<number>(1000000); // Budget initial : 1 000 000 FCFA
  const [cash, setCash] = useState<number>(1000000);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Charger sociétés au démarrage
  useEffect(() => {
    (async () => {
      const list = await fetchCompanies();
      setCompanies(list);
      if (list.length && !symbol) setSymbol(list[0].symbol);
    })();
  }, []); // eslint-disable-line

  // Sauvegarde locale
  useEffect(() => {
    localStorage.setItem('virtual_holdings', JSON.stringify(holdings));
    localStorage.setItem('virtual_cash', String(cash));
    localStorage.setItem('virtual_budget', String(budget));
  }, [holdings, cash, budget]);

  useEffect(() => {
    const h = localStorage.getItem('virtual_holdings');
    const c = localStorage.getItem('virtual_cash');
    const b = localStorage.getItem('virtual_budget');
    if (h) {
      const parsed: Holding[] = JSON.parse(h);
      setHoldings(parsed);
      if (parsed.length) {
        refreshHoldings(parsed);
      }
    }
    if (c) setCash(Number(c));
    if (b) setBudget(Number(b));
  }, []);

  async function handleBuy() {
    if (!symbol || quantity <= 0) return;
    setLoading(true);
    try {
      const quote = await fetchCompanyQuote(symbol);
      const price = quote?.latest_price ?? 0;
      const totalCost = price * quantity;

      if (totalCost > cash) {
        alert("Fonds insuffisants !");
        return;
      }

      setCash((prev) => prev - totalCost);
      setHoldings((prev) => {
        const existing = prev.find((h) => h.symbol === symbol);
        if (existing) {
          const newQty = existing.quantity + quantity;
          const newBuyPrice =
            (existing.buyPrice * existing.quantity + price * quantity) / newQty;
          return prev.map((h) =>
            h.symbol === symbol
              ? { ...h, quantity: newQty, buyPrice: newBuyPrice }
              : h
          );
        }
        const comp = companies.find((c) => c.symbol === symbol);
        return [
          ...prev,
          { symbol, name: comp?.name, quantity, buyPrice: price },
        ];
      });
      setQuantity(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSell(sym: string) {
    const h = holdings.find((x) => x.symbol === sym);
    if (!h) return;

    const quote = await fetchCompanyQuote(sym);
    const price = quote?.latest_price ?? h.buyPrice;
    const proceeds = h.quantity * price;

    setCash((prev) => prev + proceeds);
    setHoldings((prev) => prev.filter((x) => x.symbol !== sym));
  }

  async function refreshHoldings(list: Holding[] = holdings) {
    if (!list.length) return;
    setUpdating(true);
    try {
      const updated = await Promise.all(
        list.map(async (h) => {
          const quote = await fetchCompanyQuote(h.symbol);
          return {
            ...h,
            currentPrice: quote?.latest_price ?? h.currentPrice ?? h.buyPrice,
          };
        })
      );
      setHoldings(updated);
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  }

  const totalInvested = holdings.reduce(
    (sum, h) => sum + h.buyPrice * h.quantity,
    0
  );
  const totalValue = holdings.reduce(
    (sum, h) => sum + (h.currentPrice ?? h.buyPrice) * h.quantity,
    0
  );
  const pnl = totalValue + cash - budget;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">💼 Portefeuille Virtuel — Simulation BRVM</h1>

      {/* Budget */}
      <Card>
        <div className="grid md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-gray-500 text-sm">Budget Initial</p>
            <p className="text-2xl font-semibold">{budget.toLocaleString()} FCFA</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Trésorerie Disponible</p>
            <p className="text-2xl font-semibold text-blue-600">{cash.toLocaleString()} FCFA</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Valeur du Portefeuille</p>
            <p className="text-2xl font-semibold text-green-600">{totalValue.toLocaleString()} FCFA</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Gain / Perte</p>
            <p
              className={`text-2xl font-semibold ${
                pnl >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {pnl >= 0 ? '+' : ''}
              {pnl.toLocaleString()} FCFA
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <label htmlFor="budget-input" className="font-medium">
              Ajuster le budget :
            </label>
            <input
              id="budget-input"
              type="number"
              className="border rounded-lg px-3 py-1 w-32"
              value={budget}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isNaN(next)) {
                  setBudget(next);
                }
              }}
            />
            <button
              type="button"
              className="px-3 py-1 rounded-lg border"
              onClick={() => {
                setCash(budget);
                setHoldings([]);
              }}
            >
              Réinitialiser le portefeuille
            </button>
          </div>
          <button
            type="button"
            onClick={() => refreshHoldings()}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
            disabled={updating || holdings.length === 0}
          >
            {updating ? 'Actualisation…' : 'Actualiser les cours'}
          </button>
        </div>
      </Card>

      {/* Formulaire d'achat */}
      <Card>
        <div className="grid md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Société</label>
            <select
              className="w-full border rounded-xl p-3"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            >
              {companies.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.symbol} — {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Quantité</label>
            <input
              type="number"
              className="w-full border rounded-xl p-3"
              value={quantity}
              min={1}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div>
            <button
              onClick={handleBuy}
              className="bg-green-600 text-white px-6 py-3 rounded-xl w-full"
              disabled={loading}
            >
              {loading ? 'Achat...' : 'Acheter'}
            </button>
          </div>
          <div>
            <button
              onClick={() => {
                if (confirm('Réinitialiser le portefeuille ?')) {
                  setHoldings([]);
                  setCash(budget);
                }
              }}
              className="bg-gray-700 text-white px-6 py-3 rounded-xl w-full"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </Card>

      {/* Liste des positions */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">Positions actuelles</h2>
        {holdings.length === 0 ? (
          <div className="text-sm text-gray-500">Aucune position pour le moment.</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-2 px-3 text-left">Symbole</th>
                <th className="py-2 px-3 text-left">Société</th>
                <th className="py-2 px-3 text-right">Quantité</th>
                <th className="py-2 px-3 text-right">Prix Achat</th>
                <th className="py-2 px-3 text-right">Valeur Actuelle</th>
                <th className="py-2 px-3 text-right">Gain/Perte</th>
                <th className="py-2 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => {
                const currentPrice = h.currentPrice ?? h.buyPrice;
                const gain = (currentPrice - h.buyPrice) * h.quantity;
                return (
                  <tr key={h.symbol} className="border-b">
                    <td className="py-2 px-3">{h.symbol}</td>
                    <td className="py-2 px-3">{h.name}</td>
                    <td className="py-2 px-3 text-right">{h.quantity}</td>
                    <td className="py-2 px-3 text-right">{h.buyPrice.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{currentPrice.toLocaleString()}</td>
                    <td
                      className={`py-2 px-3 text-right font-semibold ${
                        gain >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {gain >= 0 ? '+' : ''}
                      {gain.toLocaleString()} FCFA
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleSell(h.symbol)}
                        className="text-red-600 hover:underline"
                      >
                        Vendre
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
