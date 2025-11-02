'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabaseClient';

interface Lesson {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function EducationPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    supabase.from('edu_articles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setLessons(data);
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold mb-4">Éducation financière</h1>
        {lessons.length === 0 ? (
          <p className="text-gray-500">Aucun contenu pour le moment.</p>
        ) : (
          lessons.map((lesson) => (
            <div key={lesson.id} className="mb-6">
              <h2 className="text-lg font-bold">{lesson.title}</h2>
              <p className="text-xs text-gray-500 mb-2">
                Publié le {new Date(lesson.created_at).toLocaleDateString('fr-FR')}
              </p>
              <p className="whitespace-pre-wrap">{lesson.content}</p>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
