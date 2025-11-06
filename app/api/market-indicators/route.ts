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
    
    // S'assurer que brvm_composite est inclus
    const indicators = {
      brvm_composite: latestIndicator.brvm_composite,
      brvm_30: latestIndicator.brvm_30,
      brvm_prestige: latestIndicator.brvm_prestige,
      brvm_croissance: latestIndicator.brvm_croissance,
      
      // Variations journalières
      variation_journaliere_brvm_composite: latestIndicator.variation_journaliere_brvm_composite,
      variation_journaliere_brvm_30: latestIndicator.variation_journaliere_brvm_30,
      variation_journaliere_brvm_prestige: latestIndicator.variation_journaliere_brvm_prestige,
      variation_journaliere_brvm_croissance: latestIndicator.variation_journaliere_brvm_croissance,
      
      // Variations YTD
      variation_ytd_brvm_composite: latestIndicator.variation_ytd_brvm_composite,
      variation_ytd_brvm_30: latestIndicator.variation_ytd_brvm_30,
      variation_ytd_brvm_prestige: latestIndicator.variation_ytd_brvm_prestige,
      variation_ytd_brvm_croissance: latestIndicator.variation_ytd_brvm_croissance,
      
      extraction_date: latestIndicator.extraction_date,
      capitalisation_globale: latestIndicator.capitalisation_globale,
      volume_moyen_annuel: latestIndicator.volume_moyen_annuel,
      valeur_moyenne_annuelle: latestIndicator.valeur_moyenne_annuelle,
    };
    
    return NextResponse.json(indicators);
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
