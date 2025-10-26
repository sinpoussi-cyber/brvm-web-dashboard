import { API_BASE_URL } from "./config";

export async function fetchData(endpoint: string) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      cache: "no-store"
    });
    if (!response.ok) throw new Error("Erreur API");
    return await response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    return null;
  }
}
