'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import { initCinetPay } from '@/lib/cinetpay';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const [amount, setAmount] = useState(2000); // abonnement standard
  const router = useRouter();

  async function handlePayment() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.email && !user?.phone) {
      alert('Veuillez vous connecter avant de payer.');
      router.push('/auth/login');
      return;
    }

    await initCinetPay({
      amount,
      description: 'Abonnement BRVM Dashboard',
      email: user.email || '',
      phone: user.phone || '',
      name: `${user.first_name} ${user.last_name}`,
    });
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <h1 className="text-2xl font-bold mb-4 text-center">Paiement de l’abonnement</h1>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Choisissez votre mode de paiement (Orange Money, Wave, Visa…)
        </p>
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold">{amount.toLocaleString()} FCFA</p>
          <button
            onClick={handlePayment}
            className="bg-green-600 text-white px-6 py-3 rounded-xl w-full"
          >
            Payer maintenant
          </button>
        </div>
      </Card>
    </div>
  );
}
