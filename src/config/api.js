// src/config/api.js
export const API_BASE_URL = "https://brvm-api-xode.onrender.com/api/v1/market";

export async function fetchData(endpoint) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Erreur API:", err);
    return null;
  }
}
