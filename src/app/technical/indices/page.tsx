'use client';
import { useEffect, useState } from 'react';
import { getIndexSeries10m, getIndexSeries20d } from '@/lib/api';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import Card from '@/components/ui/Card';

type IndexKey = 'composite' | 'brvm30' | 'prestige' | 'croissance';

const LABELS: Record<IndexKey, string> = {
  composite: 'BRVM Composite',
  brvm30: 'BRVM 30',
  prestige: 'BRVM Prestige',
  croissance: 'BRVM Croissance'
};

export default function IndicesPage() {
  const [selected, setSelected] = useState<IndexKey>('composite');
  const [data20d, setData20d] = useState<{ d: string; v: number }[]>([]);
  const [data10m, setData10m] = useState<{ mois: string; moyenne: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [d20, d10] = await Promise.all([
          getIndexSeries20d(selected),
          getIndexSeries10m(selected)
        ]);
        setData20d(d20);
        setData10m(d10);
      } catch (e) {
        console.error('Erreur de chargement', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [selected]);

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Analyse Technique — Indices BRVM</h1>
      <p className="text-gray-600 mb-6">
        Visualisation de l’évolution des quatre indices principaux de la BRVM 
        sur les 20 derniers jours et la moyenne mensuelle des 10 derniers mois.
      </p>

      {/* Sélecteur d’indice */}
      <div className="flex flex-wrap gap-3 mb-4">
        {(Object.keys(LABELS) as IndexKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setSelected(k)}
            className={`px-4 py-2 rounded-xl border text-sm transition ${
              selected === k
                ? 'bg-black text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {LABELS[k]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Chargement des données...</div>
      ) : (
        <>
          {/* === Graphique 1 : 20 derniers jours === */}
          <Card>
            <div className="text-lg font-semibold mb-2">Évolution sur 20 derniers jours</div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data20d}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="d" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name={LABELS[selected]}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* === Graphique 2 : Moyenne sur 10 mois === */}
          <Card>
            <div className="text-lg font-semibold mb-2">
              Moyenne mensuelle — 10 derniers mois
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={data10m.map((x) => ({
                  ...x,
                  label: x.mois?.slice(0, 7),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                <Bar dataKey="moyenne" fill="#10b981" name={LABELS[selected]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </main>
  );
}
