import { z } from "zod";

export const RESET_MIN_PASSWORD_LENGTH = 8;

export const resetPasswordFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "La contraseña es obligatoria")
      .min(
        RESET_MIN_PASSWORD_LENGTH,
        `La contraseña debe tener al menos ${RESET_MIN_PASSWORD_LENGTH} caracteres`,
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
export type ResetPasswordFieldErrors = Partial<Record<keyof ResetPasswordFormValues, string>>;

export function validateResetPasswordForm(
  newPassword: string,
  confirmPassword: string,
): ResetPasswordFieldErrors {
  const result = resetPasswordFormSchema.safeParse({ newPassword, confirmPassword });
  if (result.success) return {};

  const errors: ResetPasswordFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ResetPasswordFormValues;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}
