import axios from "axios";

const baseURL = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_VERSION}`;

const client = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Gestion centralisée des erreurs
client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erreur API :", error?.response?.status, error?.message);
    if (error?.response?.status === 401) {
      console.warn("L'API nécessite une authentification.");
    }
    return Promise.reject(error);
  }
);

export default client;
