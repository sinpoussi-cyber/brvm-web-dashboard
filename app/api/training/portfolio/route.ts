import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type PortfolioHolding = {
  company_id: string;
  quantity: number;
  total_invested: number;
  current_price?: number | null;
  current_value?: number | null;
  gain_loss?: number | null;
  gain_loss_percent?: number | null;
};

type PortfolioResponse = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  initial_capital: number;
  cash_balance: number;
  is_active: boolean;
  current_value?: number | null;
  gain_loss?: number | null;
  gain_loss_percent?: number | null;
  holdings?: PortfolioHolding[];
  [key: string]: unknown;
};

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    // Récupérer le portefeuille virtuel de l'utilisateur
    const { data: portfolioRaw, error: portfolioError } = await supabase
      .from('portfolios')
      .select(`
        *,
        holdings:holdings (
          *,
          companies:companies (
            symbol,
            name,
            sector
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('type', 'virtual')
      .eq('is_active', true)
      .single();
    
    if (portfolioError && portfolioError.code !== 'PGRST116') {
      console.error('Erreur portfolio:', portfolioError);
      return NextResponse.json({ error: portfolioError.message }, { status: 500 });
    }

    const portfolio = (portfolioRaw ?? null) as PortfolioResponse | null;
    
    if (!portfolio) {
      return NextResponse.json({ portfolio: null });
    }
    
    // Mettre à jour les prix actuels des holdings
    if (portfolio.holdings && portfolio.holdings.length > 0) {
      for (const holding of portfolio.holdings) {
        const { data: latestPrice } = await supabase
          .from('historical_data')
          .select('price')
          .eq('company_id', holding.company_id)
          .order('trade_date', { ascending: false })
          .limit(1)
          .single();
        
        if (latestPrice) {
          holding.current_price = latestPrice.price;
          holding.current_value = latestPrice.price * holding.quantity;
          holding.gain_loss = holding.current_value - holding.total_invested;
          holding.gain_loss_percent = (holding.gain_loss / holding.total_invested) * 100;
        }
      }
    }
    
    // Calculer la valeur totale du portefeuille
    const holdingsValue = portfolio.holdings?.reduce<number>((sum, h) => {
      return sum + (h.current_value ?? 0);
    }, 0) ?? 0;
    const totalValue = portfolio.cash_balance + holdingsValue;
    const totalGainLoss = totalValue - portfolio.initial_capital;
    const totalGainLossPercent = (totalGainLoss / portfolio.initial_capital) * 100;
    
    return NextResponse.json({
      ...portfolio,
      current_value: totalValue,
      gain_loss: totalGainLoss,
      gain_loss_percent: totalGainLossPercent,
      holdings_value: holdingsValue
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, initial_capital, type = 'virtual' } = body;
    
    if (!name || !initial_capital || initial_capital < 100000) {
      return NextResponse.json({ 
        error: 'Nom et capital initial minimum de 100 000 FCFA requis' 
      }, { status: 400 });
    }
    
    // Créer le portefeuille
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        name: name,
        type: type,
        initial_capital: initial_capital,
        current_value: initial_capital,
        cash_balance: initial_capital,
        is_active: true
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erreur création portfolio:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
