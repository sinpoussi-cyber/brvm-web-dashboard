'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card from './ui/Card';

export default function RecapSummaryChart({ data }: { data: any[] }) {
  const count = {
    acheter: data.filter(d => d.recommendation?.toLowerCase().includes('acheter')).length,
    conserver: data.filter(d => d.recommendation?.toLowerCase().includes('conserver')).length,
    vendre: data.filter(d => d.recommendation?.toLowerCase().includes('vendre')).length,
  };

  const chartData = [
    { name: 'Acheter', value: count.acheter },
    { name: 'Conserver', value: count.conserver },
    { name: 'Vendre', value: count.vendre },
  ];

  const COLORS = ['#16a34a', '#fbbf24', '#dc2626'];

  return (
    <Card>
      <h3 className="text-xl font-semibold mb-3">Répartition globale des recommandations</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={100} label>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
