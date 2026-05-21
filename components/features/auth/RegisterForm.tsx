"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import {
  type RegisterFieldErrors,
  REGISTER_MIN_PASSWORD_LENGTH,
  validateRegisterForm,
} from "@/lib/validations/register";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-12 rounded-full border-border bg-input pl-12 pr-4 text-foreground placeholder:text-muted-foreground hover:border-primary/35 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:shadow-[0_0_0_3px_rgba(193,255,114,0.15)]";

const inputErrorClassName =
  "border-destructive hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30 focus-visible:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]";

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function getFormValues(form: HTMLFormElement) {
    return {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
      confirmPassword: (form.elements.namedItem("confirmPassword") as HTMLInputElement).value,
    };
  }

  function applyFieldValidation(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    field?: keyof RegisterFieldErrors,
  ) {
    const errors = validateRegisterForm(name, email, password, confirmPassword);
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
    const { name, email, password, confirmPassword } = getFormValues(form);

    if (!applyFieldValidation(name, email, password, confirmPassword)) return;

    setIsLoading(true);
    setError(null);

    try {
      await register({ name, email, password });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h2 className="font-headline text-2xl font-bold text-foreground">Crea tu cuenta</h2>
        <p className="text-muted-foreground text-sm mt-2">Completa el formulario para comenzar.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="name" className="section-tag">
            Nombre
          </Label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Tu nombre"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              onBlur={(e) => {
                const form = e.currentTarget.form;
                if (!form) return;
                const { email, password, confirmPassword } = getFormValues(form);
                applyFieldValidation(
                  e.target.value.trim(),
                  email,
                  password,
                  confirmPassword,
                  "name",
                );
              }}
              className={cn(inputClassName, fieldErrors.name && inputErrorClassName)}
            />
          </div>
          {fieldErrors.name && (
            <p id="name-error" className="text-xs text-destructive px-1">
              {fieldErrors.name}
            </p>
          )}
        </div>

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
                const { name, password, confirmPassword } = getFormValues(form);
                applyFieldValidation(
                  name,
                  e.target.value.trim(),
                  password,
                  confirmPassword,
                  "email",
                );
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
              autoComplete="new-password"
              placeholder="••••••••"
              minLength={REGISTER_MIN_PASSWORD_LENGTH}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              onBlur={(e) => {
                const form = e.currentTarget.form;
                if (!form) return;
                const { name, email, confirmPassword } = getFormValues(form);
                applyFieldValidation(name, email, e.target.value, confirmPassword, "password");
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
                const { name, email, password } = getFormValues(form);
                applyFieldValidation(name, email, password, e.target.value, "confirmPassword");
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
          {isLoading ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>
    </div>
  );
}
