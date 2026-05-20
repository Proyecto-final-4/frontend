function messageFromBody(text: string, fallback: string): string {
  const trimmed = text.trim();
  if (!trimmed) return fallback;

  try {
    const body = JSON.parse(trimmed) as { error?: string; message?: string };
    return body.error ?? body.message ?? trimmed;
  } catch {
    return trimmed;
  }
}

function fallbackForStatus(status: number, fallback: string): string {
  if (status === 401 || status === 403) {
    return "Sesión expirada o no válida. Cierra sesión e inicia sesión de nuevo.";
  }
  if (status === 404) {
    return "Recurso no encontrado en el servidor.";
  }
  return fallback;
}

/** @deprecated Prefer throwJavaApiErrorFromResponse */
export function throwJavaApiError(text: string, fallback: string): never {
  const message = messageFromBody(text, fallback);
  throw new Error(message);
}

export async function throwJavaApiErrorFromResponse(
  res: Response,
  fallback: string,
): Promise<never> {
  const text = await res.text();
  const statusFallback = fallbackForStatus(res.status, fallback);
  const message = messageFromBody(text, statusFallback);
  throw new Error(message);
}
