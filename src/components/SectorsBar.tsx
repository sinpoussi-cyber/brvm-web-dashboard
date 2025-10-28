"use client";

type SectorDatum = {
  sector: string;
  total_volume: number;
};

function formatVolume(value: number) {
  return Number.isFinite(value)
    ? value.toLocaleString("fr-FR", { maximumFractionDigits: 0 })
    : "0";
}

export function SectorsBar({ data }: { data: SectorDatum[] }) {
  const sanitized = (data || []).filter(
    (item): item is SectorDatum =>
      Boolean(item) &&
      typeof item.sector === "string" &&
      typeof item.total_volume === "number"
  );

  const maxValue = sanitized.length
    ? Math.max(...sanitized.map((item) => item.total_volume), 0)
    : 0;

  return (
    <section className="card" aria-label="Volumes échangés par secteur">
      <div className="font-semibold mb-3">Volumes par secteur</div>
      {sanitized.length === 0 ? (
        <p className="text-sm text-slate-500">
          Aucune donnée secteur disponible pour cette séance.
        </p>
      ) : (
        <ul className="space-y-4">
          {sanitized.map((item) => {
            const percentage = maxValue > 0 ? (item.total_volume / maxValue) * 100 : 0;
            const barWidth = Math.max(percentage, percentage > 0 ? 6 : 0);

            return (
              <li key={item.sector} className="space-y-1">
                <div className="flex items-baseline justify-between gap-3 text-sm text-slate-600">
                  <span className="font-medium truncate" title={item.sector}>
                    {item.sector}
                  </span>
                  <span className="tabular-nums text-slate-700">
                    {formatVolume(item.total_volume)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="sr-only">{`${item.sector}: ${formatVolume(item.total_volume)} titres échangés`}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
