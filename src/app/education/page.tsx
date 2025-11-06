// src/app/education/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createEduArticle, listEduArticles } from '@/src/lib/supabase';

type Art = { id: string; title: string; content: string; created_at: string };

export default function EducationPage() {
  const [items, setItems] = useState<Art[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [err, setErr] = useState<string|null>(null);

  async function load() {
    try {
      const data = await listEduArticles();
      setItems(data);
    } catch (e:any) {
      setErr(e.message);
    }
  }
  useEffect(()=>{ load(); }, []);

  async function submit() {
    setErr(null);
    try {
      await createEduArticle({ title, content });
      setTitle(''); setContent('');
      load();
    } catch (e:any) {
      setErr(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Éducation financière</h1>

      <div className="rounded-2xl border p-4 bg-white">
        <div className="text-sm font-medium mb-3">Ajouter un cours / article</div>
        <div className="grid gap-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titre" className="border rounded-xl p-3" />
          <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Contenu (Markdown ou texte libre)" rows={6} className="border rounded-xl p-3" />
          <button onClick={submit} className="rounded-xl bg-black text-white px-3 py-2 w-fit">Publier</button>
          {err && <div className="text-sm text-red-600">{err}</div>}
        </div>
      </div>

      <div className="grid gap-4">
        {items.map(a => (
          <div key={a.id} className="rounded-2xl border p-4 bg-white">
            <div className="text-lg font-semibold">{a.title}</div>
            <div className="text-xs text-gray-500 mb-2">{new Date(a.created_at).toLocaleString()}</div>
            <div className="whitespace-pre-wrap text-sm text-gray-800">{a.content}</div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-500">Aucun contenu pour le moment.</div>}
      </div>
    </div>
  );
}
