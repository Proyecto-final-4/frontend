"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import {
  type LoginFieldErrors,
  LOGIN_MIN_PASSWORD_LENGTH,
  validateLoginForm,
} from "@/lib/validations/login";
import { LOGIN_ERROR_GENERIC } from "@/shared/constants/auth";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-12 rounded-full border-border bg-input pl-12 pr-4 text-foreground placeholder:text-muted-foreground hover:border-primary/35 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:shadow-[0_0_0_3px_rgba(193,255,114,0.15)]";

const inputErrorClassName =
  "border-destructive hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30 focus-visible:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  function applyFieldValidation(email: string, password: string, field?: keyof LoginFieldErrors) {
    const errors = validateLoginForm(email, password);
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
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (!applyFieldValidation(email, password)) return;

    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
      router.push("/");
    } catch {
      setError(LOGIN_ERROR_GENERIC);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h2 className="font-headline text-2xl font-bold text-foreground">Bienvenido de nuevo</h2>
        <p className="text-muted-foreground text-sm mt-2">
          Ingresa tus credenciales para acceder a tu curador.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email" className="section-tag">
            Correo electrónico
          </Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              onBlur={(e) => {
                const form = e.currentTarget.form;
                if (!form) return;
                const password = (form.elements.namedItem("password") as HTMLInputElement).value;
                applyFieldValidation(e.target.value.trim(), password, "email");
              }}
              className={cn(inputClassName, fieldErrors.email && inputErrorClassName)}
            />
          </div>
          {fieldErrors.email && (
            <p id="email-error" className="text-xs text-destructive px-1">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="section-tag">
            Contraseña
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              minLength={LOGIN_MIN_PASSWORD_LENGTH}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              onBlur={(e) => {
                const form = e.currentTarget.form;
                if (!form) return;
                const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
                applyFieldValidation(email, e.target.value, "password");
              }}
              className={cn(inputClassName, "pr-12", fieldErrors.password && inputErrorClassName)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" aria-hidden />
              ) : (
                <Eye className="w-5 h-5" aria-hidden />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p id="password-error" className="text-xs text-destructive px-1">
              {fieldErrors.password}
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
          {isLoading ? "Iniciando sesión…" : "Iniciar sesión"}
        </Button>
      </form>
    </div>
  );
}
