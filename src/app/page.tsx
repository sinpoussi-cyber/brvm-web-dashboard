'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, BarChart3, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            Investissez en bourse <br />
            <span className="text-primary">simplement</span> avec la BRVM
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plateforme d'investissement moderne pour la Bourse Régionale des Valeurs Mobilières de l'UEMOA
          </p>

            <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Voir le Dashboard
              </Button>
            </Link>
          </div>
        </div>
  
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <Card className="hover:shadow-lg transition">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="text-primary" size={24} />
              </div>
              <h3 className="font-bold text-lg">Données en Temps Réel</h3>
              <p className="text-gray-600 text-sm">
                Suivez les cours de 46 sociétés cotées à la BRVM
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="text-green-600" size={24} />
              </div>
              <h3 className="font-bold text-lg">Analyses IA</h3>
              <p className="text-gray-600 text-sm">
                Prédictions et signaux d'achat/vente automatiques
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="text-purple-600" size={24} />
              </div>
              <h3 className="font-bold text-lg">100% Sécurisé</h3>
              <p className="text-gray-600 text-sm">
                Vos données et transactions sont protégées
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="text-orange-600" size={24} />
              </div>
              <h3 className="font-bold text-lg">Interface Moderne</h3>
              <p className="text-gray-600 text-sm">
                Dashboard intuitif accessible partout
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg p-10">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary">46</div>
              <div className="text-gray-600 mt-2">Sociétés cotées</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">8</div>
              <div className="text-gray-600 mt-2">Secteurs d'activité</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">8,456 Mrd</div>
              <div className="text-gray-600 mt-2">Capitalisation (FCFA)</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Prêt à commencer ?</h2>
          <p className="text-gray-600">Créez votre compte gratuit en moins de 2 minutes</p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-12">
              S'inscrire maintenant
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>© 2025 BRVM Investment Platform. Tous droits réservés.</p>
          <p className="text-sm mt-2">
            Données fournies par{' '}
            <a
              href="https://brvm-api-xode.onrender.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              BRVM API
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
