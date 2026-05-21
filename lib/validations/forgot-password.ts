import { z } from "zod";

export const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo electrónico válido"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;
export type ForgotPasswordFieldErrors = Partial<Record<keyof ForgotPasswordFormValues, string>>;

export function validateForgotPasswordForm(email: string): ForgotPasswordFieldErrors {
  const result = forgotPasswordFormSchema.safeParse({ email });
  if (result.success) return {};

  const errors: ForgotPasswordFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ForgotPasswordFormValues;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}
