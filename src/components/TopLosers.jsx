"use client";
import React, { useEffect, useState } from "react";
import { fetchData } from "../config/api";

export default function TopLosers() {
  const [losers, setLosers] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await fetchData("/losers/top");
      if (data) setLosers(data.data);
    }
    loadData();
  }, []);

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow">
      <h2 className="text-lg font-bold mb-3 text-red-700">Top Losers</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b">
            <th>Symbole</th>
            <th>Prix</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {losers.map((l, i) => (
            <tr key={i} className="border-b hover:bg-red-100">
              <td>{l.symbol}</td>
              <td>{l.latest_price}</td>
              <td className="text-red-600 font-medium">{l.change_percent} %</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
