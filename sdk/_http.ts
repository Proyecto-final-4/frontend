const BASE_URL = process.env.BACKEND_JAVA_ENDPOINT;

if (!BASE_URL) {
  throw new Error("BACKEND_JAVA_ENDPOINT is not defined");
}

interface JavaFetchOptions extends RequestInit {
  token?: string;
}

/**
 * Base helper for all Java API calls (server-side).
 * - Prefixes BACKEND_JAVA_ENDPOINT
 * - Sets Content-Type: application/json
 * - Adds Authorization: Bearer <token> when a token is provided
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
