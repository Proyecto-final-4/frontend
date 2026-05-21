"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/hooks/use-reset-password";
import {
  type ResetPasswordFieldErrors,
  RESET_MIN_PASSWORD_LENGTH,
  validateResetPasswordForm,
} from "@/lib/validations/reset-password";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-12 rounded-full border-border bg-input pl-12 pr-4 text-foreground placeholder:text-muted-foreground hover:border-primary/35 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:shadow-[0_0_0_3px_rgba(193,255,114,0.15)]";

const inputErrorClassName =
  "border-destructive hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30 focus-visible:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]";

interface ResetPasswordFormProps {
  token: string | null;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { submit, isLoading } = useResetPassword();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordFieldErrors>({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!token) {
    return (
      <div className="w-full text-center">
        <h2 className="font-headline text-2xl font-bold text-foreground mb-4">Enlace no válido</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          El enlace no es válido o ha expirado. Solicita un nuevo enlace para restablecer tu
          contraseña.
        </p>
        <Link href="/forgot-password" className="text-primary hover:underline font-medium text-sm">
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  function getFormValues(form: HTMLFormElement) {
    return {
      newPassword: (form.elements.namedItem("newPassword") as HTMLInputElement).value,
      confirmPassword: (form.elements.namedItem("confirmPassword") as HTMLInputElement).value,
    };
  }

  function applyFieldValidation(
    newPassword: string,
    confirmPassword: string,
    field?: keyof ResetPasswordFieldErrors,
  ) {
    const errors = validateResetPasswordForm(newPassword, confirmPassword);
    if (!field) {
      setFieldErrors(errors);
      return Object.keys(errors).length === 0;
    }
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (errors[field]) next[field] = errors[field];
      else delete next[field];
      return next;
    });
    return !errors[field];
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const { newPassword, confirmPassword } = getFormValues(form);

    if (!applyFieldValidation(newPassword, confirmPassword)) return;

    setError(null);

    try {
      await submit(token, newPassword);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer la contraseña");
    }
  }

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h2 className="font-headline text-2xl font-bold text-foreground">
          Crea una nueva contraseña
        </h2>
        <p className="text-muted-foreground text-sm mt-2">Ingresa tu nueva contraseña.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="section-tag">
            Nueva contraseña
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              minLength={RESET_MIN_PASSWORD_LENGTH}
              aria-invalid={Boolean(fieldErrors.newPassword)}
              aria-describedby={fieldErrors.newPassword ? "newPassword-error" : undefined}
              onBlur={(e) => {
                const form = e.currentTarget.form;
                if (!form) return;
                const { confirmPassword } = getFormValues(form);
                applyFieldValidation(e.target.value, confirmPassword, "newPassword");
              }}
              className={cn(
                inputClassName,
                "pr-12",
                fieldErrors.newPassword && inputErrorClassName,
              )}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" aria-hidden />
              ) : (
                <Eye className="w-5 h-5" aria-hidden />
              )}
            </button>
          </div>
          {fieldErrors.newPassword && (
            <p id="newPassword-error" className="text-xs text-destructive px-1">
              {fieldErrors.newPassword}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="section-tag">
            Confirmar contraseña
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
              onBlur={(e) => {
                const form = e.currentTarget.form;
                if (!form) return;
                const { newPassword } = getFormValues(form);
                applyFieldValidation(newPassword, e.target.value, "confirmPassword");
              }}
              className={cn(
                inputClassName,
                "pr-12",
                fieldErrors.confirmPassword && inputErrorClassName,
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" aria-hidden />
              ) : (
                <Eye className="w-5 h-5" aria-hidden />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p id="confirmPassword-error" className="text-xs text-destructive px-1">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive text-center" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-full font-bold text-sm mt-4 shadow-[0_0_20px_rgba(193,255,114,0.25)]"
        >
          {isLoading ? "Guardando…" : "Guardar contraseña"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        <Link href="/login" className="hover:text-primary transition-colors">
          ← Volver al inicio de sesión
        </Link>
      </p>
    </div>
  );
}
