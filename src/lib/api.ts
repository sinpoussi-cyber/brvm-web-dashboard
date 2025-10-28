const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function buildUrl(path: string) {
  const base = RAW_BASE.replace(/\/+$/, ""); 
  const sub = path.replace(/^\/+/, "");
  return `${base}/api/v1/market/${sub}`;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function doFetch<T>(path: string): Promise<T> {
  const url = buildUrl(path);
  const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!res.ok) throw new ApiError(`Erreur API (${res.status})`, res.status);
  return res.json();
}

export const api = {
  getOverview: () => doFetch<import("../types").MarketOverview>("overview"),
  getTopGainers: () => doFetch<import("../types").TopMovesResponse>("gainers/top"),
  getTopLosers: () => doFetch<import("../types").TopMovesResponse>("losers/top"),
};
