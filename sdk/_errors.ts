export function throwJavaApiError(text: string, fallback: string): never {
  try {
    const body = JSON.parse(text) as { error?: string; message?: string };
    throw new Error(body.error ?? body.message ?? text);
  } catch (e) {
    if (e instanceof Error && e.message !== text) throw e;
    throw new Error(text || fallback);
  }
}
