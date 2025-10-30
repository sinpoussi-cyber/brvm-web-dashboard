'use client';
import { useState } from 'react';

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e:any) => {
    e.preventDefault(); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const r = await fetch('/api/register', { method: 'POST', body: fd });
    setLoading(false);
    alert(r.ok ? 'Inscription enregistrée.' : 'Erreur inscription.');
  };
  return (
    <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
      <input name="first_name" placeholder="Prénom" required className="border rounded-lg p-2"/>
      <input name="last_name" placeholder="Nom" required className="border rounded-lg p-2"/>
      <input name="email" type="email" placeholder="Email" className="border rounded-lg p-2"/>
      <input name="phone" placeholder="Téléphone" className="border rounded-lg p-2"/>
      <input name="profession" placeholder="Profession" className="border rounded-lg p-2 md:col-span-2"/>
      <select name="age_bracket" className="border rounded-lg p-2"><option>18-24</option><option>25-34</option><option>35-44</option><option>45-54</option><option>55+</option></select>
      <select name="gender" className="border rounded-lg p-2"><option>Homme</option><option>Femme</option><option>Non spécifié</option></select>
      <button disabled={loading} className="md:col-span-2 rounded-xl bg-black text-white py-3">{loading?'Envoi…':'Créer mon compte'}</button>
    </form>
  );
}
