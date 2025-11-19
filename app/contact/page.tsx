'use client';

import { useState } from 'react';
import { sendContactMessage } from '@/src/lib/supabase';

export default function ContactPage() {
  const [status, setStatus] = useState<{ ok?: string; err?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    setStatus({});

    try {
      await sendContactMessage({
        name: String(formData.get('name') || ''),
        email: String(formData.get('email') || ''),
        phone: String(formData.get('phone') || ''),
        message: String(formData.get('message') || ''),
      });
      setStatus({ ok: 'Message envoyé. Nous vous recontactons rapidement.' });
      event.currentTarget.reset();
    } catch (error: any) {
      console.error('Contact error:', error);
      setStatus({ err: 'Impossible d\'envoyer votre message pour le moment. Merci de réessayer.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Support</p>
          <h1 className="text-3xl font-bold text-gray-900">Nous contacter</h1>
          <p className="text-sm text-gray-500">Vos retours alimentent directement les optimisations de la plateforme.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Écrivez-nous</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input name="name" required className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500" placeholder="Votre nom" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" required className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500" placeholder="vous@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input name="phone" className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500" placeholder="(+225) 07 00 00 00 00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea name="message" rows={5} required className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500" placeholder="Comment pouvons-nous vous aider ?" />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? 'Envoi en cours…' : 'Envoyer'}
              </button>
            </form>
            {status.ok && <p className="text-sm text-emerald-600 mt-3">{status.ok}</p>}
            {status.err && <p className="text-sm text-red-600 mt-3">{status.err}</p>}
          </div>

          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">Coordonnées</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div>
                <p className="text-gray-500 text-xs uppercase">Email</p>
                <p className="font-semibold">sinpoussi@gmail.com</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase">Téléphone</p>
                <p className="font-semibold">+225 07 57 04 32 43</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase">Adresse</p>
                <p className="font-semibold">Cocody, Abidjan, Côte d’Ivoire</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900">
              Nos équipes mettent à jour le tableau de bord chaque jour à 04h avec les données Supabase les plus récentes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
