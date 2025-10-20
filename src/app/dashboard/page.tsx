'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
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

type LucideIcon = typeof TrendingUp;

type Fetcher = () => Promise<TopCompany[]>;

const priceFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface TopCompaniesCardProps {
  title: string;
  icon: LucideIcon;
  iconClassName: string;
  fetcher: Fetcher;
  badgeVariant: NonNullable<BadgeProps['variant']>;
}

function TopCompaniesCard({
  title,
  icon: Icon,
  iconClassName,
  fetcher,
  badgeVariant,
}: TopCompaniesCardProps) {
  const [companies, setCompanies] = useState<TopCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetcher();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-3 text-gray-500">Chargement des données...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-6 space-y-4">
          <AlertCircle className="mx-auto text-red-500" size={32} />
          <p className="text-red-600 text-sm">{error}</p>
          <Button onClick={loadCompanies} variant="outline" size="sm" className="gap-2">
            <RefreshCw size={16} />
            Réessayer
          </Button>
        </div>
      );
    }

    if (companies.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500 space-y-4">
          <p>Aucune donnée disponible</p>
          <Button onClick={loadCompanies} variant="outline" size="sm" className="gap-2">
            <RefreshCw size={16} />
            Actualiser
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {companies.map((company) => {
          const change = typeof company.change_percent === 'number' ? company.change_percent : 0;
          const absoluteChange = Math.abs(change);
          const sign = change >= 0 ? '+' : '-';
          const percentLabel = `${sign}${percentFormatter.format(absoluteChange)}%`;
          const priceValue = Number.isFinite(company.current_price) ? company.current_price : 0;
          const formattedPrice = `${priceFormatter.format(priceValue)} F`;

          return (
            <div
              key={company.symbol}
              className="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm transition hover:shadow"
            >
              <div>
                <p className="font-semibold">{company.symbol}</p>
                <p className="text-sm text-muted-foreground">{company.name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formattedPrice}</p>
                <Badge variant={badgeVariant}>{percentLabel}</Badge>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [badgeVariant, companies, error, loadCompanies, loading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={iconClassName} size={20} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const fetchTopGainers = useCallback(() => getTopGainers(5), []);
  const fetchTopLosers = useCallback(() => getTopLosers(5), []);

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
          <TopCompaniesCard
            title="Top Gainers"
            icon={TrendingUp}
            iconClassName="text-green-600"
            fetcher={fetchTopGainers}
            badgeVariant="success"
          />
          <TopCompaniesCard
            title="Top Losers"
            icon={TrendingDown}
            iconClassName="text-red-600"
            fetcher={fetchTopLosers}
            badgeVariant="destructive"
          />
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
