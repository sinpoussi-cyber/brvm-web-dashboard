import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('technical_data')
      .select('symbol, trend, rsi, macd, signal, trade_date')
      .order('trade_date', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({
        bullish_signals: 0,
        bearish_signals: 0,
        neutral_signals: 0,
        overbought: 0,
        oversold: 0,
        positive_macd: 0,
        negative_macd: 0,
        total_stocks: 0
      });
    }
    
    // Regrouper par symbole pour avoir les données les plus récentes
    const latestData = data.reduce((acc, curr) => {
      if (!acc[curr.symbol]) {
        acc[curr.symbol] = curr;
      }
      return acc;
    }, {} as Record<string, any>);
    
    const summaryData = Object.values(latestData);
    
    const summary = {
      bullish_signals: summaryData.filter(d => 
        d.trend && d.trend.toLowerCase().includes('haussier')
      ).length,
      bearish_signals: summaryData.filter(d => 
        d.trend && d.trend.toLowerCase().includes('baissier')
      ).length,
      neutral_signals: summaryData.filter(d => 
        !d.trend || d.trend.toLowerCase().includes('neutre')
      ).length,
      overbought: summaryData.filter(d => (d.rsi || 0) > 70).length,
      oversold: summaryData.filter(d => (d.rsi || 0) < 30).length,
      positive_macd: summaryData.filter(d => (d.macd || 0) > (d.signal || 0)).length,
      negative_macd: summaryData.filter(d => (d.macd || 0) <= (d.signal || 0)).length,
      total_stocks: summaryData.length
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
