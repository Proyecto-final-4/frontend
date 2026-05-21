"use client";

import { useCallback, useState } from "react";

interface UseForgotPasswordReturn {
  submit: (email: string) => Promise<void>;
  isLoading: boolean;
  succeeded: boolean;
  error: string | null;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const { error: msg } = (await res.json()) as { error?: string };
        throw new Error(msg ?? "Error al procesar la solicitud");
      }

      setSucceeded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la solicitud");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { submit, isLoading, succeeded, error };
}
