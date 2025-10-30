type Props = { params: { symbol: string } };
export default function Page({ params }:Props){
  const { symbol } = params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Fondamental — {symbol}</h1>
      <div className="rounded-xl border p-6 text-sm">Récupère `fundamental_analysis` filtré par symbol (via Supabase) + liens vers rapports.</div>
    </div>
  );
}
