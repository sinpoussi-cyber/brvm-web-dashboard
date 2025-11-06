// src/app/contact/page.tsx
'use client';

import React, { useState } from 'react';
import { sendContactMessage } from '@/src/lib/supabase';

export default function ContactPage() {
  const [state, setState] = useState<{ok?: string; err?: string}>({});

  async function onSubmit(formData: FormData) {
    setState({});
    try {
      await sendContactMessage({
        name: String(formData.get('name')||''),
        email: String(formData.get('email')||''),
        phone: String(formData.get('phone')||''),
        message: String(formData.get('message')||''),
      });
      setState({ ok: 'Message envoyé. Nous vous recontactons rapidement.' });
      (document.getElementById('contact-form') as HTMLFormElement)?.reset();
    } catch (e:any) {
      setState({ err: e.message });
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Nous contacter</h1>

      <div className="rounded-2xl border p-4 bg-white">
        <form id="contact-form" action={onSubmit} className="grid md:grid-cols-2 gap-3">
          <input name="name" placeholder="Nom complet" className="border rounded-xl p-3" required />
          <input name="email" type="email" placeholder="Email" className="border rounded-xl p-3" required />
          <input name="phone" placeholder="Téléphone" className="border rounded-xl p-3 md:col-span-2" />
          <textarea name="message" rows={5} placeholder="Votre message" className="border rounded-xl p-3 md:col-span-2" required />
          <button className="rounded-xl bg-black text-white px-3 py-2 md:col-span-2">Envoyer</button>
        </form>
        {state.ok && <div className="mt-3 text-sm text-emerald-600">{state.ok}</div>}
        {state.err && <div className="mt-3 text-sm text-red-600">{state.err}</div>}
      </div>

      <div className="rounded-2xl border p-4 bg-white text-sm text-gray-700">
        <div>Email: <b>contact@tondomaine.ci</b></div>
        <div>Téléphone: <b>+225 XX XX XX XX</b></div>
        <div>Adresse: Abidjan, Côte d’Ivoire</div>
      </div>
    </div>
  );
}
