'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    profession: '',
    age_bracket: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('users').insert([form]);
      if (error) throw error;
      alert('Inscription réussie ✅');
      router.push('/payment');
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l’inscription');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <Card>
        <h1 className="text-2xl font-bold mb-4 text-center">Créer un compte</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            ['Prénom', 'first_name'],
            ['Nom', 'last_name'],
            ['Email', 'email'],
            ['Téléphone', 'phone'],
            ['Profession', 'profession'],
            ['Tranche d’âge', 'age_bracket'],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="block text-sm text-gray-600 mb-1">{label}</label>
              <input
                type="text"
                className="w-full border rounded-xl p-3"
                required
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm text-gray-600 mb-1">Sexe</label>
            <select
              className="w-full border rounded-xl p-3"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              required
            >
              <option value="">Choisir...</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl w-full"
            disabled={loading}
          >
            {loading ? 'Inscription...' : 'Créer un compte'}
          </button>
        </form>
      </Card>
    </div>
  );
}
