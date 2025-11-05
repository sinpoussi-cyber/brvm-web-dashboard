import { NextResponse } from 'next/server';

import { buildRecommendationsDataset } from '@/lib/server/recommendations';

export async function GET() {
  try {
    const payload = await buildRecommendationsDataset();
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('API /recommendations error:', error);
    return NextResponse.json(
      { error: 'Impossible de charger les recommandations.' },
      { status: 500 }
    );
  }
}
