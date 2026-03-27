const BASE_URL = process.env.BACKEND_JAVA_ENDPOINT;

if (!BASE_URL) {
  throw new Error("BACKEND_JAVA_ENDPOINT is not defined");
}

interface JavaFetchOptions extends RequestInit {
  token?: string;
}

/**
 * Función base para todas las llamadas a la API Java (server-side).
 * - Prefija BACKEND_JAVA_ENDPOINT
 * - Agrega Content-Type: application/json
 * - Si se pasa token, agrega Authorization: Bearer <token>
 */
export async function javaFetch(path: string, options: JavaFetchOptions = {}): Promise<Response> {
  const { token, headers, ...rest } = options;

  const mergedHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: mergedHeaders,
  });
}
