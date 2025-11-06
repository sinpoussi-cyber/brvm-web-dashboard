'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Company {
  id: number;
  symbol: string;
  name: string;
  sector: string;
  latest_price?: number;
  variation?: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    try {
      const response = await fetch('/api/companies/list');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Erreur chargement sociétés:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSector = sectorFilter === 'all' || company.sector === sectorFilter;
    
    return matchesSearch && matchesSector;
  });

  const sectors = ['all', ...new Set(companies.map(c => c.sector).filter(Boolean))];

  const getVariationIcon = (variation?: number) => {
    if (!variation) return <Minus size={16} className="text-gray-400" />;
    if (variation > 0) return <TrendingUp size={16} className="text-green-600" />;
    if (variation < 0) return <TrendingDown size={16} className="text-red-600" />;
    return <Minus size={16} className="text-gray-400" />;
  };

  const getVariationColor = (variation?: number) => {
    if (!variation) return 'text-gray-600';
    return variation >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sociétés Cotées à la BRVM
          </h1>
          <p className="text-gray-600">
            {companies.length} sociétés disponibles
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par symbole ou nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sector Filter */}
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les secteurs</option>
              {sectors.filter(s => s !== 'all').map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">
              Aucune société ne correspond à votre recherche
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.symbol}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {company.symbol}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {company.name}
                    </p>
                  </div>
                  {getVariationIcon(company.variation)}
                </div>

                {company.sector && (
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                      {company.sector}
                    </span>
                  </div>
                )}

                <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                  <div>
                    {company.latest_price && (
                      <>
                        <p className="text-xs text-gray-500">Dernier cours</p>
                        <p className="text-xl font-bold text-gray-900">
                          {company.latest_price.toLocaleString('fr-FR')} FCFA
                        </p>
                      </>
                    )}
                  </div>
                  {company.variation !== undefined && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Variation</p>
                      <p className={`text-lg font-bold ${getVariationColor(company.variation)}`}>
                        {company.variation >= 0 ? '+' : ''}{company.variation.toFixed(2)}%
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
