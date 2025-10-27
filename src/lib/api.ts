import { API_BASE_URL } from "./config";

async function get<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return (await res.json()) as T;
  } catch (e) {
    console.error("Erreur API:", e);
    return null;
  }
}

export const api = {
  overview: () => get<{ overview: any; top_sectors: any[] }>("/overview"),
  gainers: () => get<{ data: any[] }>("/gainers/top"),
  losers: () => get<{ data: any[] }>("/losers/top")
};
