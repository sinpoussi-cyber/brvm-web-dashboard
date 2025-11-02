import { NextResponse } from 'next/server';
import { signupPublicUser } from '@/lib/supabase';

export async function POST(req: Request) {
  const fd = await req.formData();
  const payload = {
    first_name: String(fd.get('first_name') || ''),
    last_name: String(fd.get('last_name') || ''),
    email: String(fd.get('email') || ''),
    phone: String(fd.get('phone') || ''),
    profession: String(fd.get('profession') || ''),
    age_bracket: String(fd.get('age_bracket') || ''),
    gender: String(fd.get('gender') || ''),
    created_at: new Date().toISOString(),
  };

  // ATTENTION: nécessite une policy RLS insert autorisée pour le rôle anon sur table users
   try {
    await signupPublicUser(payload as any);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    const message = error?.message ?? 'Unable to register user';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
