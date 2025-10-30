import Card from '../ui/Card';
import Stat from '../ui/Stat';
import { fmt, pct } from '@/lib/utils';
import type { Overview } from '@/types/market';

export default function MarketKPIs({ overview }:{ overview: Overview }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card><Stat label="Perf. moyenne" value={pct(overview.avg_change_percent)} sub="Session en cours"/></Card>
      <Card><Stat label="Volume total" value={fmt.format(overview.total_volume)} sub="Titres échangés"/></Card>
      <Card><Stat label="Sociétés" value={String(overview.total_companies)} sub="Couvrant l'agrégat"/></Card>
    </div>
  );
}
