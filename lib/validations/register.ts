import { z } from "zod";

export const REGISTER_MIN_PASSWORD_LENGTH = 8;

export const registerFormSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio"),
    email: z
      .string()
      .trim()
      .min(1, "El correo es obligatorio")
      .email("Ingresa un correo electrónico válido"),
    password: z
      .string()
      .min(1, "La contraseña es obligatoria")
      .min(
        REGISTER_MIN_PASSWORD_LENGTH,
        `La contraseña debe tener al menos ${REGISTER_MIN_PASSWORD_LENGTH} caracteres`,
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type RegisterFieldErrors = Partial<Record<keyof RegisterFormValues, string>>;

export function validateRegisterForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): RegisterFieldErrors {
  const result = registerFormSchema.safeParse({ name, email, password, confirmPassword });
  if (result.success) return {};

  const errors: RegisterFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof RegisterFormValues;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}
