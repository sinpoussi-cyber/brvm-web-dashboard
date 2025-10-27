"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function SectorsBar({
  data,
}: {
  data: { sector: string; total_volume: number }[];
}) {
  return (
    <div className="card">
      <div className="font-semibold mb-3">Volumes par secteur</div>
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="sector" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_volume" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
