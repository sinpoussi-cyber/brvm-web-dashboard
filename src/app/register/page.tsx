'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { registerUser } from '@/lib/api/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await registerUser(email, password);
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'inscription. Veuillez réessayer.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-600">
              Inscription réussie ! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Votre compte a été créé avec succès.
            </p>
            <Link href="/">
              <Button className="w-full">
                Retour à l'accueil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Créer un compte</CardTitle>
          <p className="text-sm text-gray-600 text-center mt-2">
            Rejoignez la plateforme d'investissement BRVM
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 caractères
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link href="/" className="text-primary hover:underline">
                Retour à l'accueil
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
