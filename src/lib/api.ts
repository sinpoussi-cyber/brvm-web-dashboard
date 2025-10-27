const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Normalise l'URL: retire les doublons de slash et évite d'appeler le domaine Vercel */
function buildUrl(path: string) {
  const base = RAW_BASE.replace(/\/+$/, "");        // supprime le / final
  const p = path.replace(/^\/+/, "");               // supprime le / initial
  return `${base}/${p}`;
}

/** Erreurs contrôlées pour afficher des messages utiles */
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
      // Important : pas d’Authorization côté public ; pas de credentials cross-origin
      headers: {
        "Accept": "application/json",
        ...(init?.headers || {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });

    // 2xx
    if (res.ok) {
      return (await res.json()) as T;
    }

    // Récupère corps d’erreur pour debug utile
    let body: any = undefined;
    try { body = await res.json(); } catch { /* ignore */ }

    // Remonte un message clair selon codes
    if (res.status === 404) {
      throw new ApiError("Endpoint introuvable (404). Vérifie NEXT_PUBLIC_API_BASE_URL et la route.", res.status, body);
    }
    if (res.status === 401 || res.status === 403) {
      throw new ApiError("Accès refusé (401/403). Les endpoints de marché doivent être publics côté backend.", res.status, body);
    }
    throw new ApiError(`Erreur API (${res.status}).`, res.status, body);
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new ApiError("Timeout: l’API n’a pas répondu à temps.", 0);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(err?.message || "Erreur réseau", 0);
  } finally {
    clearTimeout(timeout);
  }
}

/** Endpoints métiers */
export const api = {
  getOverview: () => doFetch<import("../types").MarketOverview>("overview"),
  getTopGainers: () => doFetch<import("../types").TopMovesResponse>("gainers/top"),
  getTopLosers: () => doFetch<import("../types").TopMovesResponse>("losers/top"),
};
