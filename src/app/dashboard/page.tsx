'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { getTopGainers, getTopLosers } from '@/lib/api/market';
import type { TopCompany } from '@/types/api';

// Composant Market Overview
function MarketOverview() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Indice BRVM Composite</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">228.45</div>
          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
            <TrendingUp size={12} />
            +2.5% aujourd'hui
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1.2M</div>
          <p className="text-xs text-muted-foreground mt-1">titres échangés</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Capitalisation</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8,456 Mrd</div>
          <p className="text-xs text-muted-foreground mt-1">FCFA</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant Top Gainers
function TopGainers() {
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

// Composant Top Losers
function TopLosers() {
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

// Page principale
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble du marché BRVM</p>
        </div>
        
        <MarketOverview />
        
        <div className="grid md:grid-cols-2 gap-6">
          <TopGainers />
          <TopLosers />
        </div>
      </div>
    </div>
  );
}
