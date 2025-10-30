import Card from '../ui/Card';
import type { TopMove } from '@/types/market';
import { fmt } from '@/lib/utils';

function Table({ title, rows }:{ title:string; rows:TopMove[] }) {
  return (
    <Card>
      <div className="font-semibold mb-3">{title}</div>
      <table className="w-full text-sm">
        <thead><tr className="text-gray-500"><th className="text-left">Symbole</th><th className="text-right">Dernier</th><th className="text-right">% Var.</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.symbol} className="border-t">
              <td className="py-2">{r.symbol}</td>
              <td className="py-2 text-right">{fmt.format(r.latest_price)}</td>
              <td className={`py-2 text-right ${r.change_percent>=0?'text-green-600':'text-red-600'}`}>
                {r.change_percent.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default function TopMovers({ gainers, losers }:{ gainers:TopMove[]; losers:TopMove[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Table title="Top Gagnants" rows={gainers.slice(0,10)} />
      <Table title="Top Perdants" rows={losers.slice(0,10)} />
    </div>
  );
}
