'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { getTopGainers } from '@/lib/api/market';
import type { TopCompany } from '@/types/api';

export default function TopGainers() {
  const [gainers, setGainers] = useState<TopCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGainers = async () => {
      try {
        setLoading(true);
        const data = await getTopGainers(5);
        setGainers(data);
        setError(null);
      } catch (err) {
        setError('Impossible de charger les données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGainers();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Top Gainers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Top Gainers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="text-green-600" size={20} />
          Top Gainers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {gainers.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune donnée disponible</p>
        ) : (
          <div className="space-y-3">
            {gainers.map((company) => (
              <div
                key={company.symbol}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">{company.symbol}</p>
                  <p className="text-sm text-gray-600">{company.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {company.current_price.toLocaleString('fr-FR')} F
                  </p>
                  <Badge variant="success" className="mt-1">
                    +{company.change_percent.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
