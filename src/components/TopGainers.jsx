// src/components/TopGainers.jsx
"use client";
import React, { useEffect, useState } from "react";
import { fetchData } from "../config/api";

export default function TopGainers() {
  const [gainers, setGainers] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await fetchData("/gainers/top");
      if (data) setGainers(data.data);
    }
    loadData();
  }, []);

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
      <h2 className="text-lg font-bold mb-3 text-green-700">Top Gainers</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th>Symbole</th>
            <th>Prix</th>
            <th>+/- %</th>
          </tr>
        </thead>
        <tbody>
          {gainers.map((item, i) => (
            <tr key={i} className="border-b hover:bg-green-100">
              <td>{item.symbol}</td>
              <td>{item.latest_price}</td>
              <td className="text-green-600 font-medium">{item.change_percent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
