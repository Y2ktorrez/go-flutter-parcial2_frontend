export interface Credentials {
  name?: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  plan?: string;
  projectsCount?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/** Usa env var para que funcione en dev y producción */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

/**
 * Wrapper de fetch – T = tipo de respuesta, B = tipo del cuerpo
 */
async function request<T, B = unknown>(
  endpoint: string,
  body?: B,
  token?: string
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method : body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Error inesperado");
  }
  return res.json() as Promise<T>;
}

export const authApi = {
  login : (cred: Credentials) => request<AuthResponse, Credentials>("/auth/login",  cred),
  signup: (cred: Credentials) => request<AuthResponse, Credentials>("/auth/signup", cred),
};
