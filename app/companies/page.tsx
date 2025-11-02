'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import LineBlock from '@/components/charts/LineBlock';
import { supabase } from '@/lib/supabaseClient';

interface Company {
  symbol: string;
  name: string;
}

interface PredictionPoint {
  date: string;
  price: number;
  kind: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [data, setData] = useState<PredictionPoint[]>([]);
  const [fundamental, setFundamental] = useState<string>('');
  const [technical, setTechnical] = useState<string>('');
  const [advice, setAdvice] = useState<string>('');

  useEffect(() => {
    // Charger les sociétés disponibles
    supabase.from('companies').select('symbol,name').then(({ data }) => {
      if (data) setCompanies(data);
    });
  }, []);

  async function loadCompanyData() {
    if (!selected) return;

    // Charger prédictions
    const { data: predictions } = await supabase
      .from('predictions')
      .select('prediction_date as date, predicted_price as price')
      .eq('symbol', selected)
      .limit(20);

    const { data: history } = await supabase
      .from('historical_data')
      .select('trade_date as date, price')
      .eq('symbol', selected)
      .order('trade_date', { ascending: true })
      .limit(100);

    const merged = [
      ...(history ?? []).map((h) => ({ ...h, kind: 'Historique' })),
      ...(predictions ?? []).map((p) => ({ ...p, kind: 'Prévision' })),
    ];

    setData(merged);

    // Charger analyse technique
    const { data: tech } = await supabase
      .from('technical_analysis')
      .select('summary')
      .eq('symbol', selected)
      .limit(1)
      .single();

    // Charger analyse fondamentale
    const { data: fund } = await supabase
      .from('fundamental_analysis')
      .select('summary')
      .eq('symbol', selected)
      .limit(1)
      .single();

    setTechnical(tech?.summary ?? 'Aucune donnée technique disponible');
    setFundamental(fund?.summary ?? 'Aucune donnée fondamentale disponible');

    // Conseil global
    setAdvice(
      (tech?.summary ?? '').includes('Achat') || (fund?.summary ?? '').includes('Achat')
        ? '👉 Conseil : Acheter'
        : (tech?.summary ?? '').includes('Vente') || (fund?.summary ?? '').includes('Vente')
        ? '⚠️ Conseil : Vendre'
        : '🤝 Conseil : Conserver'
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold mb-4">Sociétés cotées à la BRVM</h1>
        <div className="flex gap-3">
          <select
            className="border rounded-lg p-2 flex-1"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Sélectionnez une société</option>
            {companies.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol} — {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={loadCompanyData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Valider
          </button>
        </div>
      </Card>

      {data.length > 0 && (
        <LineBlock
          title={`Cours ${selected} (Historique + Prévisions)`}
          data={data}
          xKey="date"
          yKey="price"
        />
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold mb-2">Analyse technique</h2>
          <p className="text-sm whitespace-pre-wrap">{technical}</p>
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">Analyse fondamentale</h2>
          <p className="text-sm whitespace-pre-wrap">{fundamental}</p>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold mb-2">Conseil d’investissement</h2>
        <p className="text-lg font-medium">{advice}</p>
      </Card>
    </div>
  );
}
