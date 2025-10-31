// src/lib/api.ts
const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '') + '';

type IndexKey = 'composite' | 'brvm30' | 'prestige' | 'croissance';

export async function fetchOverview() {
  // Via backend Render (plus fiable pour total_companies)
  const r = await fetch(`${BASE}/api/v1/market/overview`, { next: { revalidate: 60 } });
  if (!r.ok) throw new Error('overview failed');
  return r.json(); // { overview: { ... }, top_sectors: [...] }
}

export async function fetchTopGainers() {
  const r = await fetch(`${BASE}/api/v1/market/gainers/top`, { next: { revalidate: 60 } });
  if (!r.ok) throw new Error('gainers failed');
  return r.json(); // { data: [...] }
}

export async function fetchTopLosers() {
  const r = await fetch(`${BASE}/api/v1/market/losers/top`, { next: { revalidate: 60 } });
  if (!r.ok) throw new Error('losers failed');
  return r.json(); // { data: [...] }
}

// --- Supabase RPC ---
import { supabase } from './supabaseClient';

export async function getLastSnapshotFromSupabase() {
  const { data, error } = await supabase.rpc('home_latest_snapshot');
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data; // {last_extraction_date, ...}
}

export async function getIndexSeries20d(index: IndexKey) {
  const { data, error } = await supabase.rpc('index_last_20d', { index_code: index });
  if (error) throw error;
  return data as { d: string; v: number }[];
}

export async function getIndexSeries10m(index: IndexKey) {
  const { data, error } = await supabase.rpc('index_last_10m', { index_code: index });
  if (error) throw error;
  return data as { mois: string; moyenne: number }[];
}

// --- Signup ---
export type SignupForm = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  profession?: string;
  age_bracket?: string;
  gender?: string;
};

export async function registerUser(form: SignupForm) {
  const { supabase } = await import('./supabaseClient');
  const { error } = await supabase.from('users').insert({
    first_name: form.first_name || null,
    last_name : form.last_name  || null,
    email     : form.email      || null,
    phone     : form.phone      || null,
    profession: form.profession || null,
    age_bracket: form.age_bracket || null,
    gender    : form.gender     || null
  });
  if (error) throw error;
  return { ok: true };
}
