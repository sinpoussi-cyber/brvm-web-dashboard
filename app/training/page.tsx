export default function Page(){
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Training virtuel (Portefeuille)</h1>
      <p className="text-gray-600">Crée un portefeuille virtuel, achète/vends au prix marché (données historiques).</p>
      <div className="rounded-xl border p-6 text-sm">Stub: formulaire budget initial, liste sociétés, bouton “acheter virtuel”. Persist via Supabase table `portfolios` + `transactions`.</div>
    </div>
  );
}
