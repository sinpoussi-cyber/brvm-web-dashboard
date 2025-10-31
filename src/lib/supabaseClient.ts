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
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** === Indices (RPC) ===
 * On suppose que tu as créé des RPC génériques :
 * - index_last_20d(index_code text) -> (date date, value numeric)
 * - index_monthly_avg_10m(index_code text) -> (month text, avg_value numeric)
 *   with index_code in ('composite','brvm_30','prestige','croissance')
 */
export async function fetchIndexLast20d(index: 'composite'|'brvm_30'|'prestige'|'croissance') {
  const { data, error } = await supabase.rpc('index_last_20d', { index_code: index });
  if (error) throw error;
  return (data ?? []) as { date: string; value: number }[];
}

export async function fetchIndexMonthlyAvg10m(index: 'composite'|'brvm_30'|'prestige'|'croissance') {
  const { data, error } = await supabase.rpc('index_monthly_avg_10m', { index_code: index });
  if (error) throw error;
  return (data ?? []) as { month: string; avg_value: number }[];
}

/** Composite (déjà livré) */
export async function fetchCompositeLast20d(): Promise<{ date: string; value: number }[]> {
  const { data, error } = await supabase.rpc('composite_last_20d');
  if (error) throw error;
  return data || [];
}

/** Users (inscription publique) */
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

/** === Éducation (CMS minimal) === */
export async function listEduArticles() {
  const { data, error } = await supabase.from('edu_articles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createEduArticle(payload: { title: string; content: string }) {
  const { data, error } = await supabase.from('edu_articles').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

/** === Contact === */
export async function sendContactMessage(payload: { name: string; email: string; phone?: string; message: string }) {
  const { data, error } = await supabase.from('contact_messages').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}
