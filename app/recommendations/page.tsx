export default function Page(){
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Recommandations</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border p-6">
          <div className="font-semibold mb-2">Top 10 à acheter maintenant</div>
          <ul className="list-disc list-inside text-sm">…à partir de tes règles (momentum, fondamentaux, ML)</ul>
        </div>
        <div className="rounded-xl border p-6">
          <div className="font-semibold mb-2">Top 10 à vendre/éviter</div>
          <ul className="list-disc list-inside text-sm">…idem</ul>
        </div>
      </div>
      <div className="rounded-xl border p-6 text-sm">Pour chaque action: statut “Acheter/Conserver/Vendre” + score.</div>
    </div>
  );
}
