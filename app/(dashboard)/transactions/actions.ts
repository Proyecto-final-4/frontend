"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createTransaction } from "@/sdk/transactions";
import { getServerToken } from "@/shared/utils/auth-server";
import type { CreateTransactionPayload } from "@/types/transaction";

const createTransactionSchema = z.object({
  categoryId: z.string().min(1, "La categoría es requerida"),
  amount: z.coerce.number().positive("El monto debe ser mayor a cero"),
  type: z.enum(["INCOME", "EXPENSE"], { error: "Selecciona un tipo válido" }),
  transactionDate: z.string().min(1, "La fecha es requerida"),
  description: z.string().min(1, "La descripción es requerida").trim(),
  notes: z.string().trim().optional(),
});

export type CreateTransactionState = { error?: string; success?: boolean } | null;

export async function createTransactionAction(
  _prev: CreateTransactionState,
  formData: FormData,
): Promise<CreateTransactionState> {
  try {
    const raw = {
      categoryId: formData.get("categoryId"),
      amount: formData.get("amount"),
      type: formData.get("type"),
      transactionDate: formData.get("transactionDate"),
      description: formData.get("description"),
      notes: formData.get("notes") ?? undefined,
    };

    const result = createTransactionSchema.safeParse(raw);
    if (!result.success) {
      const first = result.error.issues[0];
      return { error: first?.message ?? "Datos inválidos." };
    }

    const { categoryId, amount, type, transactionDate, description, notes } = result.data;
    const token = await getServerToken();

    const payload: CreateTransactionPayload = {
      categoryId,
      amount,
      type,
      transactionDate,
      description,
      ...(notes ? { notes } : {}),
    };

    await createTransaction(token, payload);
    revalidatePath("/transactions");
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "No se pudo registrar la transacción.",
    };
  }
}
