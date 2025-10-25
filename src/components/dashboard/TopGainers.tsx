'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getTopGainers } from '@/lib/api/market';
import { fallbackTopGainers } from '@/lib/data/topMoversFallback';
import type { TopCompany } from '@/types/api';

const TOP_LIMIT = 5;

const formatNumber = (value: number | undefined, options?: Intl.NumberFormatOptions) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  return value.toLocaleString('fr-FR', options);
};

const formatPercent = (value: number | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  const formatted = formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value > 0 ? `+${formatted} %` : `${formatted} %`;
};

const formatChangeValue = (value: number | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  const formatted = formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return value > 0 ? `+${formatted} F CFA` : `${formatted} F CFA`;
};

const LoadingState = () => (
  <div className="space-y-3">
    {Array.from({ length: TOP_LIMIT }).map((_, index) => (
      <div key={index} className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

export default function TopGainers() {
  const [companies, setCompanies] = useState<TopCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getTopGainers(TOP_LIMIT);

        if (!isMounted) {
          return;
        }

        if (response.length === 0) {
          setCompanies(fallbackTopGainers);
        } else {
          setCompanies(response);
        }

        setError(null);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err instanceof Error ? err.message : "Impossible d'afficher les tops gagnants");
        setCompanies(fallbackTopGainers);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">Top Gagnants</CardTitle>
          <p className="text-sm text-gray-500">Meilleures performances de la séance</p>
        </div>
        <span className="rounded-full bg-emerald-50 p-2 text-emerald-600">
          <ArrowUpRight className="h-5 w-5" aria-hidden />
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && companies.length === 0 ? (
          <LoadingState />
        ) : (
          <ul className="space-y-3">
            {companies.map((company) => (
              <li
                key={company.symbol}
                className="flex items-center justify-between gap-4 rounded-lg border border-emerald-100 bg-emerald-50/40 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-emerald-900">{company.symbol}</p>
                  <p className="text-xs text-emerald-700">{company.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-900">
                    {formatNumber(company.current_price)} F CFA
                  </p>
                  <p className="text-xs font-medium text-emerald-600">
                    {formatPercent(company.change_percent)} ({formatChangeValue(company.change)})
                  </p>
                  {company.volume !== undefined && (
                    <p className="text-xs text-emerald-700/80">
                      Vol. {formatNumber(company.volume)} titres
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p className="text-xs text-emerald-700">
            Données d'exemple affichées. {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
