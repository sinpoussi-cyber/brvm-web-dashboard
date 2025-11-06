// src/components/SignupForm.tsx
'use client';

import React, { useState } from 'react';
import { signupPublicUser } from '@/src/lib/supabase';

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string| null>(null);
  const [err, setErr] = useState<string| null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setOk(null);
    setErr(null);
    try {
      const payload = {
        first_name: String(formData.get('first_name') || ''),
        last_name: String(formData.get('last_name') || ''),
        email: String(formData.get('email') || ''),
        phone: String(formData.get('phone') || ''),
        profession: String(formData.get('profession') || ''),
        age_bracket: String(formData.get('age_bracket') || ''),
        gender: String(formData.get('gender') || ''),
      };
      await signupPublicUser(payload);
      setOk('Inscription réussie !');
    } catch (e: any) {
      setErr(e?.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="text-sm font-medium mb-3">Créer un compte</div>
      <form action={onSubmit} className="grid md:grid-cols-2 gap-3">
        <input name="first_name" placeholder="Prénom" className="border rounded-xl p-3" required />
        <input name="last_name" placeholder="Nom" className="border rounded-xl p-3" required />
        <input name="email" type="email" placeholder="Email" className="border rounded-xl p-3" />
        <input name="phone" placeholder="Téléphone" className="border rounded-xl p-3" />
        <input name="profession" placeholder="Profession" className="border rounded-xl p-3 md:col-span-2" />
        <select name="age_bracket" className="border rounded-xl p-3">
          <option value="">Tranche d’âge</option>
          <option value="18-24">18–24</option>
          <option value="25-34">25–34</option>
          <option value="35-44">35–44</option>
          <option value="45-54">45–54</option>
          <option value="55+">55+</option>
        </select>
        <select name="gender" className="border rounded-xl p-3">
          <option value="">Sexe</option>
          <option value="H">Homme</option>
          <option value="F">Femme</option>
          <option value="N/A">Non précisé</option>
        </select>

        <button
          disabled={loading}
          className="mt-1 md:col-span-2 rounded-xl bg-black text-white py-3 font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'En cours...' : 'S’enregistrer'}
        </button>
      </form>

      {ok && <div className="mt-3 text-emerald-600 text-sm">{ok}</div>}
      {err && <div className="mt-3 text-red-600 text-sm">{err}</div>}
    </div>
  );
}
