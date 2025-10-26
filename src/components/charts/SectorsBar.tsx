"use client";
import { Sector } from "../../types/market";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SectorsBar({ data }: { data: Sector[] }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h2 className="font-semibold text-lg mb-4">Volumes par secteur</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="sector" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_volume" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
