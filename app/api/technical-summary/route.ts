import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Récupérer les données techniques récentes
    const { data: technicalDataRaw, error } = await supabase
      .from('technical_data')
      .select('*')
      .order('trade_date', { ascending: false });
    
    if (error) {
      console.error('Erreur technical_data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    type TechnicalData = {
      symbol: string;
      trade_date: string;
      trend?: string | null;
      rsi?: number | null;
      macd?: number | null;
      signal?: number | null;
    };

    const technicalData = (technicalDataRaw ?? []) as TechnicalData[];

    if (technicalData.length === 0) {
      return NextResponse.json({
        bullish_signals: 0,
        bearish_signals: 0,
        neutral_signals: 0,
        overbought: 0,
        oversold: 0,
        positive_macd: 0,
        last_update: null
      });
    }
    
    // Regrouper par symbole pour avoir seulement les données les plus récentes
    const latestBySymbol = technicalData.reduce<Record<string, TechnicalData>>((acc, curr) => {
      if (!acc[curr.symbol] || new Date(curr.trade_date) > new Date(acc[curr.symbol].trade_date)) {
        acc[curr.symbol] = curr;
      }
      return acc;
    }, {});
    
    const latestData = Object.values(latestBySymbol);
    
    // Analyser les tendances
    const summary = {
      bullish_signals: latestData.filter(d => 
        d.trend && d.trend.toLowerCase().includes('haussier')
      ).length,
      bearish_signals: latestData.filter(d => 
        d.trend && d.trend.toLowerCase().includes('baissier')
      ).length,
      neutral_signals: latestData.filter(d => 
        d.trend && d.trend.toLowerCase().includes('neutre')
      ).length,
      overbought: latestData.filter(d => (d.rsi || 0) > 70).length,
      oversold: latestData.filter(d => (d.rsi || 0) < 30).length,
      positive_macd: latestData.filter(d => (d.macd || 0) > (d.signal || 0)).length,
      negative_macd: latestData.filter(d => (d.macd || 0) <= (d.signal || 0)).length,
      last_update: technicalData[0]?.trade_date
    };
    
    return NextResponse.json(summary, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
