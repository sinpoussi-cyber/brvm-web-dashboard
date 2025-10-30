import Link from 'next/link';
export default function Page(){
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analyse fondamentale — Marché</h1>
      <p className="text-gray-600">Résumé agrégé depuis table `fundamental_analysis` (titres + mini-extraits).</p>
      <div className="rounded-xl border p-6 text-sm">
        Exemple: <Link className="text-blue-600" href="/fundamental/ORAC">Voir ORAC</Link>
      </div>
    </div>
  );
}
