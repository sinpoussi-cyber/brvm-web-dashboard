import { API_BASE_URL } from "./config";

export async function fetchData(endpoint: string) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Erreur API");
    return await res.json();
  } catch (e) {
    console.error("Erreur API:", e);
    return null;
  }
}
