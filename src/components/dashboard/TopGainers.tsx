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

  useEffect(() => {
    const fetchGainers = async () => {
      try {
        const data = await getTopGainers(5);
        setGainers(data);
      } catch (err) {
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
          <p className="text-gray-500">Chargement...</p>
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
          <p className="text-gray-500">Aucune donnée disponible</p>
        ) : (
          <div className="space-y-3">
            {gainers.map((company) => (
              <div
                key={company.symbol}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{company.symbol}</p>
                  <p className="text-sm text-gray-600">{company.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{company.current_price.toLocaleString()} F</p>
                  <Badge variant="success">+{company.change_percent.toFixed(2)}%</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
