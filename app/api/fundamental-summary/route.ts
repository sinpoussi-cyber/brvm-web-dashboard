import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Récupérer les données fondamentales récentes
    const { data: fundamentalData, error } = await supabase
      .from('fundamental_data')
      .select('*')
      .order('report_date', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Erreur fundamental_data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!fundamentalData || fundamentalData.length === 0) {
      return NextResponse.json({
        total_companies: 0,
        buy_recommendations: 0,
        sell_recommendations: 0,
        hold_recommendations: 0,
        avg_per: 0,
        avg_dividend_yield: 0,
        top_performers: []
      });
    }
    
    // Calculer les statistiques
    const buyRecs = fundamentalData.filter(d => 
      d.recommendation && (d.recommendation.toLowerCase().includes('achat') || d.recommendation.toLowerCase().includes('acheter'))
    );
    
    const sellRecs = fundamentalData.filter(d => 
      d.recommendation && (d.recommendation.toLowerCase().includes('vente') || d.recommendation.toLowerCase().includes('vendre'))
    );
    
    const holdRecs = fundamentalData.filter(d => 
      d.recommendation && (d.recommendation.toLowerCase().includes('conserver') || d.recommendation.toLowerCase().includes('neutre'))
    );
    
    const validPER = fundamentalData.filter(d => d.per && d.per > 0);
    const avgPER = validPER.length > 0 
      ? validPER.reduce((acc, d) => acc + d.per, 0) / validPER.length 
      : 0;
    
    const validDividend = fundamentalData.filter(d => d.dividend_yield && d.dividend_yield > 0);
    const avgDividend = validDividend.length > 0
      ? validDividend.reduce((acc, d) => acc + d.dividend_yield, 0) / validDividend.length
      : 0;
    
    const topPerformers = fundamentalData
      .filter(d => d.roe && d.roe > 0)
      .sort((a, b) => (b.roe || 0) - (a.roe || 0))
      .slice(0, 5)
      .map(d => ({
        symbol: d.symbol,
        company_name: d.company_name,
        roe: d.roe,
        per: d.per,
        dividend_yield: d.dividend_yield,
        recommendation: d.recommendation
      }));
    
    const summary = {
      total_companies: fundamentalData.length,
      buy_recommendations: buyRecs.length,
      sell_recommendations: sellRecs.length,
      hold_recommendations: holdRecs.length,
      avg_per: avgPER,
      avg_dividend_yield: avgDividend,
      top_performers: topPerformers
    };
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
