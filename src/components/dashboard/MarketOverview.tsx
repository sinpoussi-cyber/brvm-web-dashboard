import type { ComponentType, SVGProps } from 'react';

import { Activity, BarChart3, LineChart, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

type Trend = 'positive' | 'negative' | 'neutral';

interface OverviewMetric {
  label: string;
  value: string;
  variation: string;
  trend?: Trend;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const TREND_COLORS: Record<Trend, string> = {
  positive: 'text-emerald-600',
  negative: 'text-rose-600',
  neutral: 'text-slate-500',
};

const overviewMetrics: OverviewMetric[] = [
  {
    label: 'Indice BRVM Composite',
    value: '216,45 pts',
    variation: '+1,20 % sur la séance',
    trend: 'positive',
    icon: BarChart3,
  },
  {
    label: 'Indice BRVM 30',
    value: '185,20 pts',
    variation: '+0,82 % sur la séance',
    trend: 'positive',
    icon: LineChart,
  },
  {
    label: 'Capitalisation Boursière',
    value: '7 540 Mds F CFA',
    variation: 'Marché actions',
    trend: 'neutral',
    icon: TrendingUp,
  },
  {
    label: 'Volume des échanges',
    value: '1,2 Mds F CFA',
    variation: '56 430 titres échangés',
    trend: 'neutral',
    icon: Activity,
  },
];

const MarketOverview = () => {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {overviewMetrics.map(({ label, value, variation, icon: Icon, trend = 'neutral' }) => (
        <Card key={label} className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">{label}</CardTitle>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className={cn('text-sm font-medium', TREND_COLORS[trend])}>{variation}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
};

export default MarketOverview;
