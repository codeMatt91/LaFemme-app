import { API_URL } from "./config";
import { getToken } from "./tokenStorage";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

let onUnauthorized: (() => void) | null = null;

// L'AuthProvider registra qui il logout, così qualsiasi 401 riporta al login.
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown };

// Client per le route /api/mobile del backoffice. Aggiunge il token Bearer,
// serializza il body in JSON e trasforma le risposte d'errore in ApiError.
export async function api<T>(path: string, { body, headers, ...init }: ApiOptions = {}): Promise<T> {
  const token = await getToken();

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/mobile${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Impossibile contattare il server. Controlla la connessione.", 0);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    throw new ApiError(data?.error ?? "Si è verificato un errore.", res.status);
  }
  return data as T;
}
