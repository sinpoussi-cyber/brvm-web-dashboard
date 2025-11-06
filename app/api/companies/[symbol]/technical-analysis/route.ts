import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const supabase = await createClient();
    const { symbol } = params;
    
    // Récupérer les données techniques les plus récentes
    const { data: technical, error } = await supabase
      .from('technical_data')
      .select('*')
      .eq('symbol', symbol)
      .order('trade_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !technical) {
      return NextResponse.json({ 
        error: 'Données techniques non disponibles pour ce symbole' 
      }, { status: 404 });
    }
    
    // Déterminer les signaux
    let rsi_signal = 'Neutre';
    if (technical.rsi) {
      if (technical.rsi > 70) rsi_signal = 'Suracheté';
      else if (technical.rsi < 30) rsi_signal = 'Survendu';
    }
    
    let macd_signal = 'Neutre';
    if (technical.macd && technical.signal) {
      macd_signal = technical.macd > technical.signal ? 'Haussier' : 'Baissier';
    }
    
    let ma_signal = 'Neutre';
    if (technical.close_price && technical.ma20 && technical.ma50) {
      if (technical.close_price > technical.ma20 && technical.ma20 > technical.ma50) {
        ma_signal = 'Tendance haussière forte';
      } else if (technical.close_price < technical.ma20 && technical.ma20 < technical.ma50) {
        ma_signal = 'Tendance baissière forte';
      } else if (technical.close_price > technical.ma20) {
        ma_signal = 'Tendance haussière modérée';
      } else if (technical.close_price < technical.ma20) {
        ma_signal = 'Tendance baissière modérée';
      }
    }
    
    const analysis = {
      symbol: symbol,
      current_price: technical.close_price,
      ma20: technical.ma20,
      ma50: technical.ma50,
      rsi: technical.rsi,
      macd: technical.macd,
      signal: technical.signal,
      histogram: technical.histogram,
      trend: technical.trend,
      trade_date: technical.trade_date,
      
      // Interprétations
      rsi_signal: rsi_signal,
      macd_signal: macd_signal,
      ma_signal: ma_signal,
      
      // Score global
      overall_sentiment: calculateOverallSentiment(rsi_signal, macd_signal, ma_signal)
    };
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

function calculateOverallSentiment(rsi: string, macd: string, ma: string): string {
  let score = 0;
  
  if (rsi === 'Survendu') score += 1;
  else if (rsi === 'Suracheté') score -= 1;
  
  if (macd === 'Haussier') score += 1;
  else if (macd === 'Baissier') score -= 1;
  
  if (ma.includes('haussière')) score += 1;
  else if (ma.includes('baissière')) score -= 1;
  
  if (score >= 2) return 'Très Haussier';
  if (score === 1) return 'Haussier';
  if (score === -1) return 'Baissier';
  if (score <= -2) return 'Très Baissier';
  return 'Neutre';
}
