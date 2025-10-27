const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Construit l’URL finale : base + /api/v1/market/... */
function buildUrl(path: string) {
  const base = RAW_BASE.replace(/\/+$/, ""); // supprime les / finaux
  const sub = path.replace(/^\/+/, ""); // supprime les / initiaux
  return `${base}/api/v1/market/${sub}`;
}

class ApiError extends Error {
  status: number;
  body?: any;
  constructor(message: string, status: number, body?: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function doFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildUrl(path);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Accept": "application/json",
        ...(init?.headers || {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (res.ok) {
      return (await res.json()) as T;
    }

    let body: any = undefined;
    try {
      body = await res.json();
    } catch {}

    throw new ApiError(`Erreur API (${res.status})`, res.status, body);
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new ApiError("Timeout: API non réactive", 0);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(err?.message || "Erreur réseau", 0);
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  getOverview: () => doFetch<import("../types").MarketOverview>("overview"),
  getTopGainers: () => doFetch<import("../types").TopMovesResponse>("gainers/top"),
  getTopLosers: () => doFetch<import("../types").TopMovesResponse>("losers/top"),
};
