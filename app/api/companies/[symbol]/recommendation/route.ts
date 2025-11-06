import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const supabase = await createClient();
    const { symbol } = params;
    
    // Récupérer données techniques
    const { data: technical } = await supabase
      .from('technical_data')
      .select('*')
      .eq('symbol', symbol)
      .order('trade_date', { ascending: false })
      .limit(1)
      .single();
    
    // Récupérer données fondamentales
    const { data: fundamental } = await supabase
      .from('fundamental_data')
      .select('*')
      .eq('symbol', symbol)
      .order('report_date', { ascending: false })
      .limit(1)
      .single();
    
    if (!technical && !fundamental) {
      return NextResponse.json({ 
        error: 'Données insuffisantes pour générer une recommandation' 
      }, { status: 404 });
    }
    
    // Calculer le score de recommandation
    let score = 0;
    const reasons: string[] = [];
    
    // Analyse technique
    if (technical) {
      if (technical.rsi) {
        if (technical.rsi < 30) {
          score += 2;
          reasons.push(`RSI à ${technical.rsi.toFixed(2)} indique un titre survendu (opportunité d'achat)`);
        } else if (technical.rsi > 70) {
          score -= 2;
          reasons.push(`RSI à ${technical.rsi.toFixed(2)} indique un titre suracheté (prudence)`);
        } else if (technical.rsi < 40) {
          score += 1;
          reasons.push(`RSI à ${technical.rsi.toFixed(2)} proche de la zone de survente`);
        } else if (technical.rsi > 60) {
          score -= 1;
          reasons.push(`RSI à ${technical.rsi.toFixed(2)} proche de la zone de surachat`);
        }
      }
      
      if (technical.macd !== null && technical.signal !== null) {
        if (technical.macd > technical.signal) {
          score += 1;
          reasons.push('MACD au-dessus de la ligne de signal (momentum positif)');
        } else {
          score -= 1;
          reasons.push('MACD en-dessous de la ligne de signal (momentum négatif)');
        }
      }
      
      if (technical.close_price && technical.ma20 && technical.ma50) {
        if (technical.close_price > technical.ma20 && technical.ma20 > technical.ma50) {
          score += 2;
          reasons.push('Prix au-dessus des moyennes mobiles avec alignement haussier');
        } else if (technical.close_price < technical.ma20 && technical.ma20 < technical.ma50) {
          score -= 2;
          reasons.push('Prix en-dessous des moyennes mobiles avec alignement baissier');
        } else if (technical.close_price > technical.ma20) {
          score += 1;
          reasons.push('Prix au-dessus de la MA20 (court terme positif)');
        } else if (technical.close_price < technical.ma20) {
          score -= 1;
          reasons.push('Prix en-dessous de la MA20 (court terme négatif)');
        }
      }
    }
    
    // Analyse fondamentale
    if (fundamental) {
      if (fundamental.per) {
        if (fundamental.per < 10 && fundamental.per > 0) {
          score += 2;
          reasons.push(`PER très attractif à ${fundamental.per.toFixed(2)}`);
        } else if (fundamental.per < 15 && fundamental.per > 0) {
          score += 1;
          reasons.push(`PER attractif à ${fundamental.per.toFixed(2)}`);
        } else if (fundamental.per > 25) {
          score -= 1;
          reasons.push(`PER élevé à ${fundamental.per.toFixed(2)} (valorisation élevée)`);
        }
      }
      
      if (fundamental.dividend_yield && fundamental.dividend_yield > 0) {
        if (fundamental.dividend_yield > 5) {
          score += 2;
          reasons.push(`Excellent rendement de dividende: ${fundamental.dividend_yield.toFixed(2)}%`);
        } else if (fundamental.dividend_yield > 3) {
          score += 1;
          reasons.push(`Bon rendement de dividende: ${fundamental.dividend_yield.toFixed(2)}%`);
        }
      }
      
      if (fundamental.roe && fundamental.roe > 0) {
        if (fundamental.roe > 20) {
          score += 2;
          reasons.push(`ROE excellent: ${fundamental.roe.toFixed(2)}%`);
        } else if (fundamental.roe > 15) {
          score += 1;
          reasons.push(`ROE solide: ${fundamental.roe.toFixed(2)}%`);
        }
      }
      
      if (fundamental.roa && fundamental.roa > 0) {
        if (fundamental.roa > 10) {
          score += 1;
          reasons.push(`ROA performant: ${fundamental.roa.toFixed(2)}%`);
        }
      }
      
      if (fundamental.pbr && fundamental.pbr > 0) {
        if (fundamental.pbr < 1) {
          score += 1;
          reasons.push(`PBR inférieur à 1 (${fundamental.pbr.toFixed(2)}) - potentiellement sous-évalué`);
        }
      }
    }
    
    // Déterminer la recommandation finale
    let recommendation: string;
    let recommendation_level: string;
    let action_color: string;
    
    if (score >= 6) {
      recommendation = 'Achat Fort';
      recommendation_level = 'strong_buy';
      action_color = 'green';
    } else if (score >= 3) {
      recommendation = 'Achat';
      recommendation_level = 'buy';
      action_color = 'lightgreen';
    } else if (score >= -2) {
      recommendation = 'Conserver';
      recommendation_level = 'hold';
      action_color = 'yellow';
    } else if (score >= -5) {
      recommendation = 'Vente';
      recommendation_level = 'sell';
      action_color = 'orange';
    } else {
      recommendation = 'Vente Forte';
      recommendation_level = 'strong_sell';
      action_color = 'red';
    }
    
    return NextResponse.json({
      symbol,
      recommendation,
      recommendation_level,
      action_color,
      score,
      max_score: 10,
      reasons,
      technical_data: technical ? {
        rsi: technical.rsi,
        macd: technical.macd,
        signal: technical.signal,
        close_price: technical.close_price,
        ma20: technical.ma20,
        ma50: technical.ma50,
        trade_date: technical.trade_date
      } : null,
      fundamental_data: fundamental ? {
        per: fundamental.per,
        pbr: fundamental.pbr,
        roe: fundamental.roe,
        roa: fundamental.roa,
        dividend_yield: fundamental.dividend_yield,
        report_date: fundamental.report_date
      } : null,
      last_update: technical?.trade_date || fundamental?.report_date
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
