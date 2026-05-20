import { z } from "zod";

export const LOGIN_MIN_PASSWORD_LENGTH = 8;

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo electrónico válido"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(
      LOGIN_MIN_PASSWORD_LENGTH,
      `La contraseña debe tener al menos ${LOGIN_MIN_PASSWORD_LENGTH} caracteres`,
    ),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type LoginFieldErrors = Partial<Record<keyof LoginFormValues, string>>;

export function validateLoginForm(email: string, password: string): LoginFieldErrors {
  const result = loginFormSchema.safeParse({ email, password });
  if (result.success) return {};

  const errors: LoginFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof LoginFormValues;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}
