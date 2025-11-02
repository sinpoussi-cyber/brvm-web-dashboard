import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'public-anon-key';
const HAS_REAL_SUPABASE = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** RPC: composite_last_20d (date,value) */
export async function fetchCompositeLast20d(): Promise<{ date: string; value: number }[]> {
  if (!HAS_REAL_SUPABASE) return [];
  const { data, error } = await supabase.rpc('composite_last_20d');
  if (error) throw error;
  return data || [];
}

/** Indices helpers */
export async function fetchIndexLast20d(index: 'composite'|'brvm_30'|'prestige'|'croissance') {
  if (!HAS_REAL_SUPABASE) return [];
  const { data, error } = await supabase.rpc('index_last_20d', { index_code: index });
  if (error) throw error;
  return (data ?? []) as { date: string; value: number }[];
}

export async function fetchIndexMonthlyAvg10m(index: 'composite'|'brvm_30'|'prestige'|'croissance') {
  if (!HAS_REAL_SUPABASE) return [];
  const { data, error } = await supabase.rpc('index_monthly_avg_10m', { index_code: index });
  if (error) throw error;
  return (data ?? []) as { month: string; avg_value: number }[];
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
  if (!HAS_REAL_SUPABASE) {
    throw new Error('Supabase credentials not configured');
  }
  const { data, error } = await supabase.from('users').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

/** Éducation (CMS minimal) */
export async function listEduArticles() {
  const { data, error } = await supabase.from('edu_articles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createEduArticle(payload: { title: string; content: string }) {
  const { data, error } = await supabase.from('edu_articles').insert(payload).select('*').single();
  if (!HAS_REAL_SUPABASE) {
    throw new Error('Supabase credentials not configured');
  }
  if (error) throw error;
  return data;
}

/** Contact */
export async function sendContactMessage(payload: { name: string; email: string; phone?: string; message: string }) {
  const { data, error } = await supabase.from('contact_messages').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}
