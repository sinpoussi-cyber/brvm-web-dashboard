import apiClient, { handleApiError } from "./client";

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthTokens> {
  try {
    const { data } = await apiClient.post("/auth/login", credentials);
    return data;
  } catch (error) {
    handleApiError(error as any);
  }
}

export async function register(credentials: RegisterCredentials): Promise<AuthTokens> {
  try {
    const { data } = await apiClient.post("/auth/register", credentials);
    return data;
  } catch (error) {
    handleApiError(error as any);
  }
}

export async function refreshToken(token: string): Promise<AuthTokens> {
  try {
    const { data } = await apiClient.post("/auth/refresh", { token });
    return data;
  } catch (error) {
    handleApiError(error as any);
  }
}
