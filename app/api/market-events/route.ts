import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('market_events')
      .select('id, title, description, event_date, category, location, starts_at, created_at')
      .order('event_date', { ascending: false })
      .limit(8);

    if (error) {
      console.error('Erreur market_events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { events: data ?? [] },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('Erreur serveur events:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
