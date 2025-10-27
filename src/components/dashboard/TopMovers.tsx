"use client";
import type { GainerLoser } from "../../types/market";

export default function TopMovers({
  title,
  data,
  positive
}: {
  title: string;
  data: GainerLoser[];
  positive?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h2 className="font-semibold text-lg mb-2">{title}</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-left">
              <th className="py-2">Symbole</th>
              <th className="py-2">Prix</th>
              <th className="py-2">Variation</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.symbol} className="border-t">
                <td className="py-2">{row.symbol}</td>
                <td className="py-2">{row.latest_price}</td>
                <td className={`py-2 ${positive ? "text-green-600" : "text-red-600"}`}>
                  {row.change_percent} %
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-slate-400">
                  Aucune donnée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
