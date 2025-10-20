'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
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
function LoadingCard({ title, icon: Icon }: { title: string; icon: typeof TrendingUp }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon size={20} className="text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-3 text-gray-500">Chargement des données...</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorCard({
  title,
  icon: Icon,
  message,
  onRetry,
}: {
  title: string;
  icon: typeof TrendingUp;
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon size={20} className="text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6 space-y-4">
          <AlertCircle className="mx-auto text-red-500" size={32} />
          <p className="text-red-600 text-sm">{message}</p>
          <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
            <RefreshCw size={16} />
            Réessayer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyCard({ title, icon: Icon, onRetry }: {
  title: string;
  icon: typeof TrendingUp;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon size={20} className="text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6 text-gray-500 space-y-4">
          <p>Aucune donnée disponible</p>
          <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
            <RefreshCw size={16} />
            Actualiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TopGainers() {
  const [gainers, setGainers] = useState<TopCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGainers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTopGainers(5);
      setGainers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
        fetchGainers();
  }, []);

  if (loading) {
    return <LoadingCard title="Top Gainers" icon={TrendingUp} />;
  }

  if (error) {
    return <ErrorCard title="Top Gainers" icon={TrendingUp} message={error} onRetry={fetchGainers} />;
  }

  if (gainers.length === 0) {
    return <EmptyCard title="Top Gainers" icon={TrendingUp} onRetry={fetchGainers} />;
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
         <div className="space-y-3">
          {gainers.map((company) => (
            <div
              key={company.symbol}
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
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
      </CardContent>
    </Card>
  );
}
function TopLosers() {
  const [losers, setLosers] = useState<TopCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLosers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTopLosers(5);
      setLosers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLosers();
  }, []);

  if (loading) {
     return <LoadingCard title="Top Losers" icon={TrendingDown} />;
  }

  if (error) {
    return <ErrorCard title="Top Losers" icon={TrendingDown} message={error} onRetry={fetchLosers} />;
  }

  if (losers.length === 0) {
    return <EmptyCard title="Top Losers" icon={TrendingDown} onRetry={fetchLosers} />;
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
        <div className="space-y-3">
          {losers.map((company) => (
            <div
              key={company.symbol}
              className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition"
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
      </CardContent>
    </Card>
  );
}
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
         <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600 mt-2">Vue d'ensemble du marché BRVM</p>
          </div>
          <div className="text-sm text-gray-500">
            API: {process.env.NEXT_PUBLIC_API_URL || 'Non configuré'}
          </div>
        </div>

          <MarketOverview />
        
        <div className="grid md:grid-cols-2 gap-6">
          <TopGainers />
          <TopLosers />
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 mt-0.5" size={20} />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">API Backend hébergée sur Render (Free Tier)</p>
                <p className="text-blue-700">
                  Le premier chargement peut prendre 30-60 secondes si l'API était inactive. Cliquez sur "Réessayer" si les données
                  ne se chargent pas immédiatement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
