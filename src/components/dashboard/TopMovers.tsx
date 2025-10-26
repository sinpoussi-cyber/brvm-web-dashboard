"use client";
import { GainerLoser } from "../../types/market";

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
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400">
            <th>Symbole</th>
            <th>Prix</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.symbol} className="border-t">
              <td>{row.symbol}</td>
              <td>{row.latest_price}</td>
              <td className={positive ? "text-green-600" : "text-red-600"}>
                {row.change_percent} %
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
