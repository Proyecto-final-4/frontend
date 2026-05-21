"use client";

import { useCallback, useState } from "react";

interface UseResetPasswordReturn {
  submit: (token: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useResetPassword(): UseResetPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (token: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!res.ok) {
      const { error: msg } = (await res.json()) as { error?: string };
      setIsLoading(false);
      throw new Error(msg ?? "Error al restablecer la contraseña");
    }

    setIsLoading(false);
  }, []);

  return { submit, isLoading, error };
}
