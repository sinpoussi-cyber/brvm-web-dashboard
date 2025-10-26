// src/components/MarketOverview.jsx
"use client";
import React, { useEffect, useState } from "react";
import { fetchData } from "../config/api";

export default function MarketOverview() {
  const [overview, setOverview] = useState(null);
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    async function loadOverview() {
      const data = await fetchData("/overview");
      if (data) {
        setOverview(data.overview);
        setSectors(data.top_sectors);
      }
    }
    loadOverview();
  }, []);

  if (!overview) return <p>Chargement des données du marché...</p>;

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">Vue d’ensemble du marché</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-500">Variation moyenne</p>
          <p className={`text-lg font-semibold ${overview.avg_change_percent >= 0 ? "text-green-600" : "text-red-600"}`}>
            {overview.avg_change_percent} %
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Volume total</p>
          <p className="text-lg font-semibold">{overview.total_volume.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Sociétés</p>
          <p className="text-lg font-semibold">{overview.total_companies}</p>
        </div>
      </div>

      <h3 className="mt-6 text-lg font-semibold">Top secteurs</h3>
      <ul className="mt-2">
        {sectors.map((s, i) => (
          <li key={i} className="flex justify-between border-b py-1">
            <span>{s.sector}</span>
            <span className="font-medium">{s.total_volume.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
