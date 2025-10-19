'use client';

import { useEffect, useState } from 'react';
import { useCompanies } from '@/lib/hooks/useCompanies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, TrendingUp, TrendingDown } from 'lucide-react';

export default function CompaniesPage() {
  const { companies, isLoading, error, fetchCompanies } = useCompanies();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const filteredCompanies = companies.filter(company =>
    company.symbol.toLowerCase().includes(search.toLowerCase()) ||
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Sociétés Cotées BRVM</h1>
          <p className="text-gray-600 mt-2">
            Explorez les {companies.length} sociétés cotées à la BRVM
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Rechercher par symbole ou nom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {filteredCompanies.length} société(s) trouvée(s)
            </div>
          </CardContent>
        </Card>

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
          <div className="text-center py-12 text-gray-500">
            Aucune société trouvée
          </div>
        )}
      </div>
    </div>
  );
}
