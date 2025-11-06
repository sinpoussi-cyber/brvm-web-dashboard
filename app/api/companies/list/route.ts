import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Récupérer toutes les sociétés
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('symbol', { ascending: true });
    
    if (error) {
      console.error('Erreur récupération sociétés:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!companies || companies.length === 0) {
      return NextResponse.json([]);
    }

    // Enrichir avec les dernières données de prix
    const enrichedCompanies = await Promise.all(
      companies.map(async (company) => {
        try {
          // Récupérer le dernier prix
          const { data: latestPrice } = await supabase
            .from('historical_data')
            .select('price, trade_date')
            .eq('company_id', company.id)
            .order('trade_date', { ascending: false })
            .limit(2);

          if (latestPrice && latestPrice.length > 0) {
            const currentPrice = latestPrice[0].price;
            let variation = 0;

            // Calculer la variation si on a deux prix
            if (latestPrice.length > 1) {
              const previousPrice = latestPrice[1].price;
              if (previousPrice > 0) {
                variation = ((currentPrice - previousPrice) / previousPrice) * 100;
              }
            }

            return {
              ...company,
              latest_price: currentPrice,
              variation: variation,
              last_update: latestPrice[0].trade_date
            };
          }

          return company;
        } catch (err) {
          console.error(`Erreur enrichissement ${company.symbol}:`, err);
          return company;
        }
      })
    );
    
    return NextResponse.json(enrichedCompanies);
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
