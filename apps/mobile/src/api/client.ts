import type { ApiErrorBody } from '../types';

/**
 * URL de base de l'API. Configurable via la variable d'environnement
 * `EXPO_PUBLIC_API_URL` (voir .env.example) — nécessaire notamment pour
 * pointer vers `10.0.2.2` sur l'émulateur Android ou l'IP LAN sur un
 * appareil physique.
 */
const DEFAULT_BASE_URL = 'http://localhost:3000';

export function getApiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_BASE_URL;
}

/** Erreur API porteuse d'un statut HTTP, pour un affichage clair dans l'UI. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string | null;
  body?: unknown;
}

/**
 * Client HTTP minimal autour de `fetch`.
 * - Sérialise le body en JSON et pose le header `Authorization: Bearer`.
 * - Renvoie le corps désérialisé, ou `undefined` pour une 204.
 * - Lève une `ApiError` avec le message d'erreur structuré de l'API.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', token, body } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Identifie le client mobile : l'API ne renvoie le jeton JWT dans le corps
    // JSON que pour ce client (le web s'authentifie via cookie httpOnly).
    'X-Client': 'mobile',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message = (data as ApiErrorBody | null)?.error?.message ?? `Erreur ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}
