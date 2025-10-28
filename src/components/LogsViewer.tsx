"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";

type LogsViewerProps = {
  title?: string;
  logs: string[];
  className?: string;
};

type LogEntry = { line: string; index: number };

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cx(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

export function LogsViewer({ title = "Journal de déploiement", logs, className }: LogsViewerProps) {
  const [query, setQuery] = useState("");

  const entries = useMemo<LogEntry[]>(() => logs.map((line, index) => ({ line, index })), [logs]);

  const filteredLogs = useMemo(() => {
    if (!query.trim()) return entries;
    const q = query.trim().toLowerCase();
    return entries.filter((entry) => entry.line.toLowerCase().includes(q));
  }, [entries, query]);

  const highlight = (line: string): ReactNode => {
    if (!query.trim()) return line;

    const regex = new RegExp(`(${escapeRegExp(query.trim())})`, "ig");
    const parts = line.split(regex);

    return parts.map((part, index) =>
      index % 2 === 1 ? (
        <mark key={index} className="rounded bg-amber-200 px-0.5 text-amber-900">
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <div className={cx("card space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-lg font-semibold">{title}</div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>Astuce :</span>
          <kbd className="rounded border bg-gray-100 px-1.5 py-0.5 font-medium text-gray-700 shadow-sm">Ctrl</kbd>
          <span>+</span>
          <kbd className="rounded border bg-gray-100 px-1.5 py-0.5 font-medium text-gray-700 shadow-sm">F</kbd>
          <span>pour chercher.</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher dans les logs"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div className="text-xs text-gray-500">
        {filteredLogs.length} ligne{filteredLogs.length > 1 ? "s" : ""} correspondante{filteredLogs.length > 1 ? "s" : ""} / {logs.length} au total
      </div>

      <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-mono">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500">Aucun résultat pour « {query.trim()} ».</div>
        ) : (
          <ul className="space-y-1">
            {filteredLogs.map((entry) => (
              <li key={`${entry.index}-${entry.line}`} className="flex items-start gap-3 whitespace-pre-wrap">
                <span className="w-10 select-none text-right text-xs text-gray-400">{entry.index + 1}</span>
                <span>{highlight(entry.line)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
