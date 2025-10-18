import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Activity, DollarSign } from 'lucide-react';

export default function MarketOverview() {
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
