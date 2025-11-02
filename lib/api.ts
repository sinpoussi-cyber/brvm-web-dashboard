'use server';

import { supabase } from '@/lib/supabaseClient';

/**
 * =============================
 *  📘 EDUCATION FINANCIÈRE
 * =============================
 */

/** Liste des articles d’éducation financière */
export async function getEducationArticles() {
  const { data, error } = await supabase
    .from('edu_articles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * =============================
 *  💹 SOCIÉTÉS / PREDICTIONS
 * =============================
 */

/** Liste des sociétés cotées (nom + symbole) */
export async function getCompanies() {
  const { data, error } = await supabase.from('companies').select('symbol,name').order('symbol');
  if (error) throw error;
  return data;
}

/** Historique + Prévisions pour une société (RPC Supabase) */
export async function getCompanyPredictions(symbol: string) {
  const { data, error } = await supabase.rpc('get_company_predictions', { symbol });
  if (error) throw error;
  return data;
}

/** Résumés technique/fondamental + conseil global (RPC Supabase) */
export async function getCompanyAnalysis(symbol: string) {
  const { data, error } = await supabase.rpc('get_company_analysis', { symbol });
  if (error) throw error;
  return data?.[0] ?? null;
}

/**
 * =============================
 *  📊 RECOMMANDATIONS
 * =============================
 */

/** Recommandations globales (Top/Flop/Achat/Vente/Conserver) */
export async function getRecommendations() {
  const { data, error } = await supabase.rpc('get_recommendations');
  if (error) throw error;
  return data;
}

/**
 * =============================
 *  🪙 PAIEMENTS / ABONNEMENT
 * =============================
 */

/** Enregistrement manuel d’un paiement */
export async function recordPayment(paymentData: {
  transaction_id: string;
  amount: number;
  status: string;
  user_email?: string;
}) {
  const { error } = await supabase.from('payments').insert([paymentData]);
  if (error) throw error;
  return { success: true };
}

/**
 * =============================
 *  🧑 UTILISATEURS
 * =============================
 */

/** Enregistrement d’un nouvel utilisateur (inscription) */
export async function registerUser(user: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  profession?: string;
  age_bracket?: string;
  gender?: string;
}) {
  const { error } = await supabase.from('users').insert([user]);
  if (error) throw error;
  return { success: true };
}

/** Liste des utilisateurs (si admin ou pour debug) */
export async function getAllUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data;
}

/**
 * =============================
 *  🧮 INDICES DE MARCHÉ
 * =============================
 */

/** Dernières moyennes 10 mois pour chaque indice */
export async function getIndexEvolution(indexName: string) {
  // indexName ∈ ['brvm_composite', 'brvm_30', 'brvm_prestige', 'brvm_croissance']
  const { data, error } = await supabase.rpc(`${indexName}_avg_10m`);
  if (error) throw error;
  return data;
}

/** Derniers indicateurs du marché (capitalisation, volume, valeur, etc.) */
export async function getMarketOverview() {
  const { data, error } = await supabase.from('new_market_indicators').select('*').order('extraction_date', { ascending: false }).limit(1);
  if (error) throw error;
  return data?.[0];
}
