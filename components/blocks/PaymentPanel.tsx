'use client';
import Card from '../ui/Card';

export default function PaymentPanel() {
  const click = (m:string)=>alert(`Intégration ${m} à raccorder au prestataire.\nPrévu: webhook + page /payment/callback`);
  return (
    <Card>
      <div className="font-semibold mb-3">Souscrire / Recharger</div>
      <div className="grid grid-cols-3 gap-3">
        <button onClick={()=>click('Orange Money')} className="rounded-xl bg-orange-100 hover:bg-orange-200 py-3">Orange Money</button>
        <button onClick={()=>click('Wave')} className="rounded-xl bg-blue-100 hover:bg-blue-200 py-3">Wave</button>
        <button onClick={()=>click('Carte (Visa/Stripe)')} className="rounded-xl bg-green-100 hover:bg-green-200 py-3">Carte</button>
      </div>
      <p className="text-xs text-gray-500 mt-3">Stub fonctionnel. Prévoir providers réels + vérif KYC.</p>
    </Card>
  );
}
