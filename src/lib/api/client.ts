import axios, { AxiosError } from "axios";

const baseURL = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_VERSION}`;

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

/**
 * Gestion centralisée des erreurs API
 */
export function handleApiError(error: AxiosError): never {
  if (error.response) {
    console.error("Erreur API:", error.response.status, error.response.data);
  } else if (error.request) {
    console.error("Erreur réseau: aucune réponse reçue du serveur");
  } else {
    console.error("Erreur interne:", error.message);
  }
  throw error;
}

export default apiClient;
