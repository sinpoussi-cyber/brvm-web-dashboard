'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${identifier},phone.eq.${identifier}`)
        .limit(1)
        .single();

      if (error || !data) throw error;
      localStorage.setItem('user', JSON.stringify(data));
      alert('Connexion réussie ✅');
      router.push('/dashboard');
    } catch {
      alert('Utilisateur non trouvé');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <h1 className="text-2xl font-bold mb-4 text-center">Se connecter</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Email ou téléphone
            </label>
            <input
              type="text"
              className="w-full border rounded-xl p-3"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl w-full"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </Card>
    </div>
  );
}
