import { fetchOverview, fetchTopGainers, fetchTopLosers, fetchComposite20d, fetchMeta } from '@/lib/api';
import MarketKPIs from '@/components/blocks/MarketKPIs';
import TopMovers from '@/components/blocks/TopMovers';
import IndicesPanel from '@/components/blocks/IndicesPanel';
import PaymentPanel from '@/components/blocks/PaymentPanel';
import Card from '@/components/ui/Card';
import RegisterForm from '@/components/forms/RegisterForm';

export default async function HomePage() {
  const [overview, gainers, losers, composite, meta] = await Promise.all([
    fetchOverview(), fetchTopGainers(), fetchTopLosers(), fetchComposite20d(), fetchMeta()
  ]);

  return (
    <div className="space-y-6">
      <div className="text-3xl font-bold">Tableau de bord BRVM</div>

      <MarketKPIs overview={overview} />

      <div className="grid md:grid-cols-3 gap-4">
        <Card><div className="text-sm text-gray-500">Dernière date (Supabase)</div>
          <div className="text-xl font-semibold">{meta.lastDate ?? '—'}</div>
        </Card>
        <Card><div className="text-sm text-gray-500">Sociétés cotées</div>
          <div className="text-xl font-semibold">{meta.companies}</div>
        </Card>
        <PaymentPanel />
      </div>

      <IndicesPanel composite={composite} />
      <TopMovers gainers={gainers} losers={losers} />

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="text-lg font-semibold mb-2">Inscription</div>
          <RegisterForm />
        </Card>
        <Card>
          <div className="text-lg font-semibold mb-2">Analyses globales</div>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Résumé Fondamental agrégé (liens vers /fundamental)</li>
            <li>Résumé Technique agrégé (liens vers /technical)</li>
            <li>Prédictions globales (liens vers /predictions)</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
