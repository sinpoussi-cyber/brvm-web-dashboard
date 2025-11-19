import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Récupérer le dernier indicateur de marché
    const { data: latestIndicator, error } = await supabase
      .from('new_market_indicators')
      .select('*')
      .order('extraction_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Erreur récupération indicateurs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!latestIndicator) {
      return NextResponse.json({ error: 'Aucun indicateur disponible' }, { status: 404 });
    }

    const toNumber = (value: unknown, fallback?: unknown) => {
      const parsed = Number(value ?? fallback);
      return Number.isFinite(parsed) ? parsed : null;
    };

    // S'assurer que brvm_principal est exposé et que toutes les valeurs sont numériques
    const indicators = {
      brvm_composite: toNumber(latestIndicator.brvm_composite),
      brvm_30: toNumber(latestIndicator.brvm_30),
      brvm_prestige: toNumber(latestIndicator.brvm_prestige),
      brvm_principal: toNumber(latestIndicator.brvm_principal, latestIndicator.brvm_croissance),
      
      // Variations journalières
      variation_journaliere_brvm_composite: toNumber(latestIndicator.variation_journaliere_brvm_composite),
      variation_journaliere_brvm_30: toNumber(latestIndicator.variation_journaliere_brvm_30),
      variation_journaliere_brvm_prestige: toNumber(latestIndicator.variation_journaliere_brvm_prestige),
      variation_journaliere_brvm_principal: toNumber(
        latestIndicator.variation_journaliere_brvm_principal,
        latestIndicator.variation_journaliere_brvm_croissance,
      ),
      
      // Variations YTD
      variation_ytd_brvm_composite: toNumber(latestIndicator.variation_ytd_brvm_composite),
      variation_ytd_brvm_30: toNumber(latestIndicator.variation_ytd_brvm_30),
      variation_ytd_brvm_prestige: toNumber(latestIndicator.variation_ytd_brvm_prestige),
      variation_ytd_brvm_principal: toNumber(
        latestIndicator.variation_ytd_brvm_principal,
        latestIndicator.variation_ytd_brvm_croissance,
      ),
      
      extraction_date: latestIndicator.extraction_date,
       capitalisation_globale: toNumber(latestIndicator.capitalisation_globale),
      volume_moyen_annuel: toNumber(latestIndicator.volume_moyen_annuel),
      valeur_moyenne_annuelle: toNumber(latestIndicator.valeur_moyenne_annuelle),
    };

    return NextResponse.json(indicators, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
