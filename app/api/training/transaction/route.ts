import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    const body = await request.json();
    const { portfolio_id, symbol, quantity, transaction_type } = body;
    
    if (!portfolio_id || !symbol || !quantity || !transaction_type) {
      return NextResponse.json({ 
        error: 'Paramètres manquants' 
      }, { status: 400 });
    }
    
    // Vérifier que le portefeuille appartient à l'utilisateur
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolio_id)
      .eq('user_id', user.id)
      .single();
    
    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portefeuille non trouvé' }, { status: 404 });
    }
    
    // Récupérer la société
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, symbol, name')
      .eq('symbol', symbol)
      .single();
    
    if (companyError || !company) {
      return NextResponse.json({ error: 'Société non trouvée' }, { status: 404 });
    }
    
    // Récupérer le prix actuel
    const { data: latestPrice, error: priceError } = await supabase
      .from('historical_data')
      .select('price')
      .eq('company_id', company.id)
      .order('trade_date', { ascending: false })
      .limit(1)
      .single();
    
    if (priceError || !latestPrice) {
      return NextResponse.json({ error: 'Prix non disponible' }, { status: 404 });
    }
    
    const price = latestPrice.price;
    const total_amount = price * quantity;
    const fees = total_amount * 0.01; // 1% de frais
    const net_amount = transaction_type === 'buy' 
      ? total_amount + fees 
      : total_amount - fees;
    
    if (transaction_type === 'buy') {
      // ACHAT
      
      // Vérifier les liquidités
      if (portfolio.cash_balance < net_amount) {
        return NextResponse.json({ 
          error: `Liquidités insuffisantes. Disponible: ${portfolio.cash_balance.toFixed(0)} FCFA, Requis: ${net_amount.toFixed(0)} FCFA` 
        }, { status: 400 });
      }
      
      // Enregistrer la transaction
      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          portfolio_id,
          company_id: company.id,
          transaction_type: 'buy',
          quantity,
          price,
          total_amount,
          fees,
          net_amount
        });
      
      if (transError) {
        console.error('Erreur transaction:', transError);
        return NextResponse.json({ error: transError.message }, { status: 500 });
      }
      
      // Mettre à jour le portefeuille
      const { error: updateError } = await supabase
        .from('portfolios')
        .update({
          cash_balance: portfolio.cash_balance - net_amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', portfolio_id);
      
      if (updateError) {
        console.error('Erreur mise à jour portfolio:', updateError);
      }
      
      // Mettre à jour ou créer la position
      const { data: existingHolding } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolio_id)
        .eq('company_id', company.id)
        .maybeSingle();
      
      if (existingHolding) {
        // Mettre à jour la position existante
        const new_quantity = existingHolding.quantity + quantity;
        const new_total_invested = existingHolding.total_invested + net_amount;
        const new_average_price = new_total_invested / new_quantity;
        
        await supabase
          .from('holdings')
          .update({
            quantity: new_quantity,
            average_price: new_average_price,
            total_invested: new_total_invested,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingHolding.id);
      } else {
        // Créer une nouvelle position
        await supabase
          .from('holdings')
          .insert({
            portfolio_id,
            company_id: company.id,
            quantity,
            average_price: price,
            total_invested: net_amount,
            current_price: price,
            current_value: price * quantity
          });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Achat de ${quantity} actions ${symbol} à ${price.toFixed(0)} FCFA effectué avec succès`
      });
      
    } else if (transaction_type === 'sell') {
      // VENTE
      
      // Vérifier la position
      const { data: holding, error: holdingError } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolio_id)
        .eq('company_id', company.id)
        .single();
      
      if (holdingError || !holding) {
        return NextResponse.json({ 
          error: 'Vous ne possédez pas cette action' 
        }, { status: 400 });
      }
      
      if (holding.quantity < quantity) {
        return NextResponse.json({ 
          error: `Quantité insuffisante. Disponible: ${holding.quantity}, Demandé: ${quantity}` 
        }, { status: 400 });
      }
      
      // Enregistrer la transaction
      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          portfolio_id,
          company_id: company.id,
          transaction_type: 'sell',
          quantity,
          price,
          total_amount,
          fees,
          net_amount
        });
      
      if (transError) {
        console.error('Erreur transaction:', transError);
        return NextResponse.json({ error: transError.message }, { status: 500 });
      }
      
      // Mettre à jour le portefeuille
      await supabase
        .from('portfolios')
        .update({
          cash_balance: portfolio.cash_balance + net_amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', portfolio_id);
      
      // Mettre à jour ou supprimer la position
      if (holding.quantity === quantity) {
        // Vendre toute la position
        await supabase
          .from('holdings')
          .delete()
          .eq('id', holding.id);
      } else {
        // Vendre partiellement
        const new_quantity = holding.quantity - quantity;
        const proportion_sold = quantity / holding.quantity;
        const new_total_invested = holding.total_invested * (1 - proportion_sold);
        
        await supabase
          .from('holdings')
          .update({
            quantity: new_quantity,
            total_invested: new_total_invested,
            updated_at: new Date().toISOString()
          })
          .eq('id', holding.id);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Vente de ${quantity} actions ${symbol} à ${price.toFixed(0)} FCFA effectuée avec succès`
      });
    } else {
      return NextResponse.json({ 
        error: 'Type de transaction invalide' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
