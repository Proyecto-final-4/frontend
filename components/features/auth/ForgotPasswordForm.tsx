"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/use-forgot-password";
import {
  type ForgotPasswordFieldErrors,
  validateForgotPasswordForm,
} from "@/lib/validations/forgot-password";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-12 rounded-full border-border bg-input pl-12 pr-4 text-foreground placeholder:text-muted-foreground hover:border-primary/35 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:shadow-[0_0_0_3px_rgba(193,255,114,0.15)]";

const inputErrorClassName =
  "border-destructive hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30 focus-visible:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]";

export function ForgotPasswordForm() {
  const { submit, isLoading, succeeded, error } = useForgotPassword();
  const [fieldErrors, setFieldErrors] = useState<ForgotPasswordFieldErrors>({});

  function applyFieldValidation(email: string, field?: keyof ForgotPasswordFieldErrors) {
    const errors = validateForgotPasswordForm(email);
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

    if (!applyFieldValidation(email)) return;

    await submit(email);
  }

  if (succeeded) {
    return (
      <div className="w-full">
        <div className="mb-8 text-center">
          <h2 className="font-headline text-2xl font-bold text-foreground">Revisa tu correo</h2>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
            Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña en
            los próximos minutos.
          </p>
        </div>
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h2 className="font-headline text-2xl font-bold text-foreground">
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="text-muted-foreground text-sm mt-2">
          Ingresa tu correo y te enviaremos instrucciones.
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
              onBlur={(e) => applyFieldValidation(e.target.value.trim(), "email")}
              className={cn(inputClassName, fieldErrors.email && inputErrorClassName)}
            />
          </div>
          {fieldErrors.email && (
            <p id="email-error" className="text-xs text-destructive px-1">
              {fieldErrors.email}
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
          {isLoading ? "Enviando…" : "Enviar instrucciones"}
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
