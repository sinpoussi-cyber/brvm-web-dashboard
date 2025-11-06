import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const supabase = await createClient();
    const { symbol } = params;
    
    // Récupérer l'ID de la société
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('symbol', symbol)
      .single();
    
    if (companyError || !company) {
      return NextResponse.json({ error: 'Société non trouvée' }, { status: 404 });
    }
    
    // Récupérer les données historiques (derniers 12 mois)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const { data: historical, error: histError } = await supabase
      .from('historical_data')
      .select('*')
      .eq('company_id', company.id)
      .gte('trade_date', oneYearAgo.toISOString().split('T')[0])
      .order('trade_date', { ascending: true });
    
    if (histError) {
      console.error('Erreur historique:', histError);
      return NextResponse.json({ error: histError.message }, { status: 500 });
    }
    
    // Récupérer les prédictions futures
    const { data: predictions, error: predError } = await supabase
      .from('predictions')
      .select('*')
      .eq('company_id', company.id)
      .gte('prediction_date', new Date().toISOString().split('T')[0])
      .order('prediction_date', { ascending: true });
    
    return NextResponse.json({
      company: {
        id: company.id,
        symbol: symbol,
        name: company.name
      },
      historical: historical || [],
      predictions: predictions || []
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
