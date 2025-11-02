import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      transaction_id,
      amount,
      status,
      customer_email,
      customer_phone_number,
    } = body;

    const { error } = await supabase.from('payments').insert([
      {
        transaction_id,
        amount,
        status,
        user_email: customer_email || customer_phone_number,
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ message: 'Paiement enregistré ✅' }, { status: 200 });
  } catch (e) {
    console.error('Erreur /api/payment-notify:', e);
    return NextResponse.json({ message: 'Erreur interne' }, { status: 500 });
  }
}
