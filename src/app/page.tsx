'use client';

import { useEffect, useState } from 'react';
import { useCompanies } from '@/lib/hooks/useCompanies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CompaniesPage() {
  const { companies, isLoading, error, fetchCompanies } = useCompanies();
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.symbol.toLowerCase().includes(search.toLowerCase()) ||
      company.name.toLowerCase().includes(search.toLowerCase());
    const matchesSector = !selectedSector || company.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const sectors = Array.from(new Set(companies.map(c => c.sector).filter(Boolean)));

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="mx-auto text-red-500" size={48} />
              <h2 className="text-2xl font-bold text-red-600">Erreur de connexion</h2>
              <p className="text-gray-600">{error}</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                <p className="text-sm text-yellow-800 font-semibold mb-2">
                  💡 L'API nécessite une authentification
                </p>
                <p className="text-xs text-yellow-700">
                  Les endpoints doivent être rendus publics côté backend pour permettre 
                  l'accès aux données de marché sans authentification.
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Sociétés Cotées BRVM</h1>
          <p className="text-gray-600 mt-2">
            {companies.length > 0 
              ? `Explorez les ${companies.length} sociétés cotées à la BRVM`
              : 'Chargement des sociétés...'}
          </p>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Rechercher par symbole ou nom..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtre par secteur */}
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les secteurs</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              {filteredCompanies.length} société(s) trouvée(s)
            </div>
          </CardContent>
        </Card>

        {/* Liste des sociétés */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Card key={company.symbol} className="hover:shadow-xl transition cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{company.symbol}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{company.name}</p>
                    </div>
                    <Building2 className="text-blue-600" size={24} />
                  </div>
                </CardHeader>
                <CardContent>
                  {company.sector && (
                    <Badge variant="secondary" className="mb-3">
                      {company.sector}
                    </Badge>
                  )}

                  {company.current_price && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Prix</span>
                        <span className="text-2xl font-bold">
                          {company.current_price.toLocaleString('fr-FR')} F
                        </span>
                      </div>

                      {company.price_change_percent !== null && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Variation</span>
                          <div className="flex items-center gap-2">
                            {company.price_change_percent >= 0 ? (
                              <>
                                <TrendingUp size={16} className="text-green-600" />
                                <Badge variant="success">
                                  +{company.price_change_percent.toFixed(2)}%
                                </Badge>
                              </>
                            ) : (
                              <>
                                <TrendingDown size={16} className="text-red-600" />
                                <Badge variant="destructive">
                                  {company.price_change_percent.toFixed(2)}%
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucune société trouvée</p>
            <p className="text-gray-400 text-sm mt-2">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
