'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { CSSProperties } from 'react';

const COLORS = [
  '#2563eb',
  '#16a34a',
  '#9333ea',
  '#f97316',
  '#dc2626',
  '#0891b2',
  '#facc15',
  '#6366f1',
];

type SeriesConfig = {
  dataKey: string;
  name?: string;
  color?: string;
  type?: 'monotone' | 'linear' | 'basis';
};

type LineBlockProps<T extends Record<string, any>> = {
  title: string;
  data: T[];
  xKey: keyof T & string;
  /** When provided, the component automatically pivots the dataset. */
  categoryKey?: keyof T & string;
  /** Value accessor used when a single line is required. */
  yKey?: keyof T & string;
  /** Custom line definitions. Overrides yKey/categoryKey logic. */
  lines?: SeriesConfig[];
  height?: number;
  style?: CSSProperties;
};

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function pivotData<T extends Record<string, any>>(options: {
  rows: T[];
  xKey: string;
  categoryKey: string;
  valueKey: string;
}) {
  const { rows, xKey, categoryKey, valueKey } = options;
  const map = new Map<string, Record<string, any>>();
  const categories: string[] = [];

  for (const row of rows) {
    const xRaw = row[xKey];
    if (xRaw === null || xRaw === undefined) continue;
    const categoryRaw = row[categoryKey];
    if (!categoryRaw) continue;
    const value = toNumber(row[valueKey]);
    if (value === undefined) continue;

    const x = String(xRaw);
    const category = String(categoryRaw);
    if (!map.has(x)) {
      map.set(x, { [xKey]: x });
    }
    const entry = map.get(x)!;
    entry[category] = value;
    if (!categories.includes(category)) {
      categories.push(category);
    }
  }

  const data = Array.from(map.values()).sort((a, b) => {
    const da = Date.parse(String(a[xKey]));
    const db = Date.parse(String(b[xKey]));
    if (!Number.isNaN(da) && !Number.isNaN(db)) return da - db;
    return String(a[xKey]).localeCompare(String(b[xKey]));
  });

  const series: SeriesConfig[] = categories.map((category, idx) => ({
    dataKey: category,
    name: category,
    color: COLORS[idx % COLORS.length],
    type: 'monotone',
  }));

  return { data, series };
}

export default function LineBlock<T extends Record<string, any>>({
  title,
  data,
  xKey,
  categoryKey,
  yKey,
  lines,
  height = 280,
  style,
}: LineBlockProps<T>) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-2xl border p-4 bg-white" style={style}>
        <div className="text-sm font-medium mb-2">{title}</div>
        <div className="text-sm text-gray-500">Aucune donnée disponible.</div>
      </div>
    );
  }

  let chartData: Record<string, any>[] = data as Record<string, any>[];
  let resolvedLines: SeriesConfig[] | undefined = lines;

  if (!resolvedLines) {
    if (categoryKey && yKey) {
      const pivot = pivotData({ rows: data, xKey, categoryKey, valueKey: yKey });
      chartData = pivot.data;
      resolvedLines = pivot.series;
    } else if (categoryKey) {
      const pivot = pivotData({ rows: data, xKey, categoryKey, valueKey: yKey ?? 'value' });
      chartData = pivot.data;
      resolvedLines = pivot.series;
    } else if (yKey) {
      resolvedLines = [
        { dataKey: yKey, name: String(yKey), color: COLORS[0], type: 'monotone' },
      ];
    }
  }

  if (!resolvedLines || !resolvedLines.length) {
    console.warn('LineBlock: aucune série définie pour', title);
    return null;
  }

  return (
    <div className="rounded-2xl border p-4 bg-white" style={style}>
      <div className="text-sm font-medium mb-3">{title}</div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} minTickGap={16} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
            {resolvedLines.map((line, idx) => (
              <Line
                key={line.dataKey}
                type={line.type ?? 'monotone'}
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color ?? COLORS[idx % COLORS.length]}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
