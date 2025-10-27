"use client";
import { Overview } from "../../types/market";

export default function OverviewCards({ data }: { data: Overview }) {
  if (!data) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg p-4 shadow">
        <p className="text-sm text-gray-500">Perf. Moyenne</p>
        <p className="text-xl font-semibold">{data.avg_change_percent}%</p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow">
        <p className="text-sm text-gray-500">Volume Total</p>
        <p className="text-xl font-semibold">{data.total_volume.toLocaleString("fr-FR")}</p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow">
        <p className="text-sm text-gray-500">Sociétés</p>
        <p className="text-xl font-semibold">{data.total_companies}</p>
      </div>
    </div>
  );
}
