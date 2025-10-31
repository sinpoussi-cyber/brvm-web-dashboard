// src/components/SignupForm.tsx
'use client';

import React, { useState } from 'react';
import { registerUser } from '@/src/lib/api';

export default function SignupForm() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    profession: '', age_bracket: '', gender: ''
  });
  const [ok, setOk] = useState<string|undefined>();
  const [err, setErr] = useState<string|undefined>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(undefined); setOk(undefined);
    try {
      await registerUser(form);
      setOk('Inscription enregistrée ✅');
      setForm({ first_name:'', last_name:'', email:'', phone:'', profession:'', age_bracket:'', gender:'' });
    } catch {
      setErr("Échec de l'inscription (Supabase/RLS).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl p-4 shadow bg-white">
      <div className="text-lg font-semibold mb-2">Ouvrir un compte</div>
      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
        <input className="border rounded-lg p-2" placeholder="Nom"
          value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})}/>
        <input className="border rounded-lg p-2" placeholder="Prénom"
          value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})}/>
        <input className="border rounded-lg p-2" placeholder="Email"
          value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <input className="border rounded-lg p-2" placeholder="Téléphone"
          value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
        <input className="border rounded-lg p-2" placeholder="Profession"
          value={form.profession} onChange={e=>setForm({...form,profession:e.target.value})}/>
        <input className="border rounded-lg p-2" placeholder="Tranche d’âge"
          value={form.age_bracket} onChange={e=>setForm({...form,age_bracket:e.target.value})}/>
        <input className="border rounded-lg p-2" placeholder="Sexe"
          value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}/>
        <div className="md:col-span-2">
          <button disabled={loading} className="px-4 py-2 rounded-xl bg-black text-white">
            {loading ? 'Enregistrement…' : "S'inscrire"}
          </button>
        </div>
        {ok && <div className="md:col-span-2 text-green-700 text-sm">{ok}</div>}
        {err && <div className="md:col-span-2 text-red-600 text-sm">{err}</div>}
      </form>

      <div className="mt-4 text-xs text-gray-500">
        Paiement OM/Wave/Visa : à intégrer (front) → passerelle côté backend.
      </div>
    </div>
  );
}
