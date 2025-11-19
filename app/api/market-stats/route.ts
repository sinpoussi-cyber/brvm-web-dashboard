import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('new_market_indicators')
      .select('*')
      .order('extraction_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Aucune statistique disponible' }, { status: 404 });
    }
    
    const toNumber = (value: unknown) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    return NextResponse.json(
      {
        extraction_date: data.extraction_date,
        created_at: data.created_at,
        capitalisation_globale: toNumber(data.capitalisation_globale),
        volume_moyen_annuel: toNumber(data.volume_moyen_annuel),
        valeur_moyenne_annuelle: toNumber(data.valeur_moyenne_annuelle),
        variation_journaliere_capitalisation_globale: toNumber(data.variation_journaliere_capitalisation_globale),
        variation_ytd_capitalisation_globale: toNumber(data.variation_ytd_capitalisation_globale),
        variation_journaliere_volume_moyen_annuel: toNumber(data.variation_journaliere_volume_moyen_annuel),
        variation_ytd_volume_moyen_annuel: toNumber(data.variation_ytd_volume_moyen_annuel),
        variation_journaliere_valeur_moyenne_annuelle: toNumber(data.variation_journaliere_valeur_moyenne_annuelle),
        variation_ytd_valeur_moyenne_annuelle: toNumber(data.variation_ytd_valeur_moyenne_annuelle),
        // Formater la date pour l'affichage
        formatted_date: data.extraction_date
          ? new Date(data.extraction_date).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : '—'
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
