// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** RPC: composite_last_20d (date,value) */
export async function fetchCompositeLast20d(): Promise<{ date: string; value: number }[]> {
  const { data, error } = await supabase.rpc('composite_last_20d');
  if (error) throw error;
  return data || [];
}

/** Inscription côté table public.users (RLS ouverte en insert pour anon) */
export async function signupPublicUser(payload: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  profession?: string;
  age_bracket?: string;
  gender?: string;
}) {
  const { data, error } = await supabase.from('users').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}
