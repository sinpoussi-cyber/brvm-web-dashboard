'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { fallbackTopGainers, fallbackTopLosers } from '@/lib/data/topMoversFallback';

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

const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

const AUTO_REFRESH_INTERVAL_MS = 60_000;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface TopCompaniesCardProps {
  title: string;
  icon: LucideIcon;
  iconClassName: string;
  fetcher: Fetcher;
  badgeVariant: NonNullable<BadgeProps['variant']>;
  fallbackData?: TopCompany[];
}

function TopCompaniesCard({
  title,
  icon: Icon,
  iconClassName,
  fetcher,
  badgeVariant,
  fallbackData = [],
}: TopCompaniesCardProps) {
  const [companies, setCompanies] = useState<TopCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const fetchInFlightRef = useRef(false);

  const loadCompanies = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      if (fetchInFlightRef.current && !force) {
        return;
      }

      fetchInFlightRef.current = true;
      setLoading(true);
      setError(null);
      setIsUsingFallback(false);

      let lastError: unknown = null;
      
      try {
        for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
          try {
            const data = await fetcher();

            if (Array.isArray(data) && data.length > 0) {
              setCompanies(data);
              setIsUsingFallback(false);
              setLastUpdated(new Date());
              return;
            }

            lastError = new Error('Aucune donnée reçue');
          } catch (err) {
            lastError = err;
          }

          if (attempt < MAX_RETRY_ATTEMPTS) {
            const delay = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
            console.warn(
              `[TopCompaniesCard] Tentative ${attempt} échouée pour ${title}. Nouvel essai dans ${delay} ms.`
            );
            await sleep(delay);
          }
        }

        if (fallbackData.length > 0) {
          console.warn(
            `[TopCompaniesCard] Utilisation des données de secours pour ${title}.`
          );
          setCompanies(fallbackData);
          setIsUsingFallback(true);
          setLastUpdated(new Date());
          return;
        }

        const message =
          lastError instanceof Error ? lastError.message : 'Erreur de chargement';
        setError(message);
        setCompanies([]);
      } finally {
        fetchInFlightRef.current = false;
        setLoading(false);
      }
      },
    [fallbackData, fetcher, title]
  );
    
  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    const interval = setInterval(() => {
      void loadCompanies();
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [loadCompanies]);

  const statusLabel = useMemo(() => {
    if (lastUpdated) {
      return `Mis à jour à ${timeFormatter.format(lastUpdated)}`;
    }

    return 'Connexion à l’API BRVM en cours…';
  }, [lastUpdated]);

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
          <Button
            onClick={() => loadCompanies({ force: true })}
            variant="outline"
            size="sm"
            className="gap-2"
          >
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
          <Button
            onClick={() => loadCompanies({ force: true })}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw size={16} />
            Actualiser
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {isUsingFallback && (
          <div className="flex items-start justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <div className="flex gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Données temporaires affichées</p>
                <p>
                  Impossible de joindre l'API distante. Les valeurs ci-dessous sont des exemples à titre
                  indicatif.
                </p>
              </div>
            </div>
            <Button
              onClick={() => loadCompanies({ force: true })}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              Réessayer
            </Button>
          </div>
        )}
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
              className="flex items-center justify-between rounded-lg border bg-card p-3 text-card-foreground shadow-sm transition hover:shadow"
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
  }, [badgeVariant, companies, error, isUsingFallback, loadCompanies, loading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={iconClassName} size={20} />
          {title}
        </CardTitle>
        <CardDescription>
          {statusLabel} • Actualisation automatique toutes les 60&nbsp;s
        </CardDescription>
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
            fallbackData={fallbackTopGainers}
          />
          <TopCompaniesCard
            title="Top Losers"
            icon={TrendingDown}
            iconClassName="text-red-600"
            fetcher={fetchTopLosers}
            badgeVariant="destructive"
            fallbackData={fallbackTopLosers}
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
