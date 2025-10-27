"use client";
import React from "react";
import type { TopMove } from "@/types";

export function TopTable({
  title,
  rows,
}: {
  title: string;
  rows: TopMove[];
}) {
  return (
    <div className="card">
      <div className="font-semibold mb-3">{title}</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Symbole</th>
              <th className="py-2 pr-4">Dernier</th>
              <th className="py-2 pr-4">% Var.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.symbol} className="border-t">
                <td className="py-2 pr-4 font-medium">{r.symbol}</td>
                <td className="py-2 pr-4">{r.latest_price}</td>
                <td className={`py-2 pr-4 ${r.change_percent >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {r.change_percent.toFixed(2)}%
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-gray-500">
                  Aucune donnée disponible.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
