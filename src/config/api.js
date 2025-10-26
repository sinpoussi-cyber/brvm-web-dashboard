// src/config/api.js

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://brvm-api-xode.onrender.com/api/v1/market";

export async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    return null;
  }
}
