'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Portfolio {
  id: string;
  name: string;
  initial_capital: number;
  current_value: number;
  cash_balance: number;
  gain_loss: number;
  gain_loss_percent: number;
  holdings_value: number;
  holdings: Array<{
    id: string;
    company_id: number;
    quantity: number;
    average_price: number;
    current_price: number;
    current_value: number;
    gain_loss: number;
    gain_loss_percent: number;
    companies: {
      symbol: string;
      name: string;
    };
  }>;
}

export default function TrainingPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState(1000000);
  
  // Transaction form
  const [selectedStock, setSelectedStock] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [transactionLoading, setTransactionLoading] = useState(false);
  
  const companies = [
    { symbol: 'TTRC', name: 'Total Côte d\'Ivoire' },
    { symbol: 'SNTS', name: 'Sonatel' },
    { symbol: 'SGBC', name: 'SGBCI' },
    { symbol: 'BOAC', name: 'BOA Côte d\'Ivoire' },
    { symbol: 'SIVC', name: 'SIVOM' },
    { symbol: 'ETIT', name: 'Ecobank Transnational' },
  ];
  
  useEffect(() => {
    loadPortfolio();
  }, []);
  
  async function loadPortfolio() {
    try {
      const response = await fetch('/api/training/portfolio');
      const data = await response.json();
      
      if (data.portfolio) {
        setPortfolio(data);
      } else {
        setPortfolio(null);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function createPortfolio() {
    if (budget < 100000) {
      alert('Le capital initial minimum est de 100 000 FCFA');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/training/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Mon Portefeuille Virtuel',
          initial_capital: budget,
          type: 'virtual'
        })
      });
      
      if (response.ok) {
        await loadPortfolio();
        alert('Portefeuille créé avec succès!');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du portefeuille');
    } finally {
      setLoading(false);
    }
  }
  
  async function executeTransaction() {
    if (!selectedStock) {
      alert('Veuillez sélectionner une action');
      return;
    }
    
    if (quantity < 1) {
      alert('La quantité doit être au moins 1');
      return;
    }
    
    setTransactionLoading(true);
    
    try {
      const response = await fetch('/api/training/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio_id: portfolio?.id,
          symbol: selectedStock,
          quantity: quantity,
          transaction_type: action
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(result.message || 'Transaction effectuée avec succès');
        await loadPortfolio();
        setSelectedStock('');
        setQuantity(1);
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la transaction');
    } finally {
      setTransactionLoading(false);
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Portefeuille Virtuel - Training
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎮</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Bienvenue dans le Mode Training
                </h2>
                <p className="text-gray-600">
                  Créez votre portefeuille virtuel pour vous entraîner à investir 
                  sur la BRVM sans risque réel
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capital initial (FCFA)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  min="100000"
                  step="100000"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Minimum: 100 000 FCFA • Suggéré: 1 000 000 FCFA
                </p>
              </div>
              
              <button
                onClick={createPortfolio}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-lg"
              >
                {loading ? 'Création...' : 'Créer mon portefeuille'}
              </button>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">💡 Conseils</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Entraînez-vous sans risque avec de l'argent virtuel</li>
                  <li>• Les prix sont basés sur les données réelles de la BRVM</li>
                  <li>• Achetez et vendez des actions comme sur le marché réel</li>
                  <li>• Suivez vos performances en temps réel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Mon Portefeuille Virtuel
        </h1>
        
        {/* Résumé du portefeuille */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <p className="text-blue-100 text-sm mb-1">Valeur Totale</p>
            <p className="text-3xl font-bold">
              {portfolio.current_value?.toLocaleString('fr-FR')} FCFA
            </p>
            <p className="text-blue-100 text-xs mt-2">
              Capital initial: {portfolio.initial_capital?.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <p className="text-gray-500 text-sm mb-1">Liquidités</p>
            <p className="text-3xl font-bold text-gray-900">
              {portfolio.cash_balance?.toLocaleString('fr-FR')} FCFA
            </p>
            <p className="text-gray-500 text-xs mt-2">Disponible pour investir</p>
          </div>
          
          <div className={`p-6 rounded-lg shadow border-l-4 ${
            portfolio.gain_loss >= 0 
              ? 'bg-green-50 border-green-500' 
              : 'bg-red-50 border-red-500'
          }`}>
            <p className="text-gray-500 text-sm mb-1">Gain/Perte</p>
            <p className={`text-3xl font-bold ${
              portfolio.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {portfolio.gain_loss >= 0 ? '+' : ''}{portfolio.gain_loss?.toLocaleString('fr-FR')} FCFA
            </p>
            <p className={`text-sm font-medium mt-2 ${
              portfolio.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {portfolio.gain_loss >= 0 ? '+' : ''}{portfolio.gain_loss_percent?.toFixed(2)}%
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm mb-1">Positions</p>
            <p className="text-3xl font-bold text-gray-900">
              {portfolio.holdings?.length || 0}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Valeur: {portfolio.holdings_value?.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        </div>
        
        {/* Formulaire de transaction */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Effectuer une Transaction</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as 'buy' | 'sell')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="buy">Acheter</option>
                <option value="sell">Vendre</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Société</label>
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner...</option>
                {companies.map((company) => (
                  <option key={company.symbol} value={company.symbol}>
                    {company.symbol} - {company.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={executeTransaction}
                disabled={!selectedStock || transactionLoading}
                className={`w-full px-4 py-2 font-medium rounded-lg transition-colors ${
                  action === 'buy'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {transactionLoading ? 'Traitement...' : action === 'buy' ? 'Acheter' : 'Vendre'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Liste des positions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mes Positions</h2>
          
          {portfolio.holdings && portfolio.holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbole
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Société
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix Moyen
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix Actuel
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valeur Actuelle
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gain/Perte
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {portfolio.holdings.map((holding) => (
                    <tr key={holding.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-900">
                          {holding.companies?.symbol}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{holding.companies?.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-gray-900">{holding.quantity}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-gray-900">
                          {holding.average_price?.toFixed(0)} FCFA
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {holding.current_price?.toFixed(0)} FCFA
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {holding.current_value?.toLocaleString('fr-FR')} FCFA
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div>
                          <span className={`text-sm font-bold ${
                            holding.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {holding.gain_loss >= 0 ? '+' : ''}{holding.gain_loss?.toFixed(0)} FCFA
                          </span>
                          <br />
                          <span className={`text-xs ${
                            holding.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ({holding.gain_loss >= 0 ? '+' : ''}{holding.gain_loss_percent?.toFixed(2)}%)
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg">Aucune position dans le portefeuille</p>
              <p className="text-gray-400 text-sm mt-2">
                Commencez par acheter des actions pour construire votre portefeuille
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
