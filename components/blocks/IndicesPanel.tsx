import Card from '../ui/Card';
import LineMini from '../charts/LineMini';
import Link from 'next/link';

export default function IndicesPanel({ composite }:{ composite:any[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-semibold">Indices</div>
        <Link href="/technical" className="text-sm text-blue-600 hover:underline">Détails</Link>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500">BRVM Composite — 20 derniers jours</div>
          <LineMini data={composite}/>
        </div>
        {/* Emplacements pour BRVM 10 / BRVM 30 si tu ajoutes l’API */}
        <div className="rounded-lg border border-dashed p-4 text-sm text-gray-500">
          BRVM 10 & 30 — à activer dès dispo API
        </div>
      </div>
    </Card>
  );
}
