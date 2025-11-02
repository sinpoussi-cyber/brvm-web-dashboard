declare global {
  interface Window {
    CinetPay: any;
  }
}

export async function initCinetPay({
  amount,
  description,
  email,
  phone,
  name,
}: {
  amount: number;
  description: string;
  email: string;
  phone: string;
  name: string;
}) {
  const transaction_id = `txn_${Date.now()}`;
  const site_id = process.env.NEXT_PUBLIC_CINETPAY_SITE_ID!;
  const api_key = process.env.NEXT_PUBLIC_CINETPAY_API_KEY!;

  const script = document.createElement('script');
  script.src = 'https://checkout.cinetpay.com/seamless/main.js';
  document.body.appendChild(script);

  script.onload = () => {
    window.CinetPay.setConfig({
      apikey: api_key,
      site_id,
      notify_url: `${window.location.origin}/api/payment-notify`,
      mode: 'PRODUCTION',
    });

    window.CinetPay.getCheckout({
      transaction_id,
      amount,
      currency: 'XOF',
      channels: 'ALL',
      description,
      customer_name: name,
      customer_email: email,
      customer_phone_number: phone,
    });

    window.CinetPay.waitResponse(function (data: any) {
      if (data.status === 'ACCEPTED') {
        alert('✅ Paiement réussi !');
        localStorage.setItem('paid', 'true');
        window.location.href = '/dashboard';
      } else {
        alert('❌ Paiement échoué ou annulé');
      }
    });
  };
}
