'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown } from 'lucide-react';
import { getTopLosers } from '@/lib/api/market';
import type { TopCompany } from '@/types/api';

export default function TopLosers() {
  const [losers, setLosers] = useState<TopCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLosers = async () => {
      try {
        const data = await getTopLosers(5);
        setLosers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLosers();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="text-red-600" size={20} />
            Top Losers
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
          <TrendingDown className="text-red-600" size={20} />
          Top Losers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {losers.length === 0 ? (
          <p className="text-gray-500">Aucune donnée disponible</p>
        ) : (
          <div className="space-y-3">
            {losers.map((company) => (
              <div
                key={company.symbol}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{company.symbol}</p>
                  <p className="text-sm text-gray-600">{company.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{company.current_price.toLocaleString()} F</p>
                  <Badge variant="destructive">{company.change_percent.toFixed(2)}%</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
