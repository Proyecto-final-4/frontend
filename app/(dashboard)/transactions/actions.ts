"use server";

import { revalidatePath } from "next/cache";
import { createTransaction } from "@/sdk/transactions";
import { getServerToken } from "@/shared/utils/auth-server";
import type { CreateTransactionPayload, TransactionType } from "@/types/transaction";

export type CreateTransactionState = { error?: string; success?: boolean } | null;

export async function createTransactionAction(
  _prev: CreateTransactionState,
  formData: FormData,
): Promise<CreateTransactionState> {
  try {
    const token = await getServerToken();
    const categoryId = String(formData.get("categoryId") ?? "");
    const amount = Number(formData.get("amount"));
    const type = String(formData.get("type") ?? "") as TransactionType;
    const transactionDate = String(formData.get("transactionDate") ?? "");
    const description = String(formData.get("description") ?? "").trim();
    const notesRaw = formData.get("notes");
    const notes = notesRaw ? String(notesRaw).trim() : undefined;

    if (!categoryId || !transactionDate || !description) {
      return { error: "Completa categoría, fecha y descripción." };
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { error: "El monto debe ser mayor a cero." };
    }
    if (type !== "INCOME" && type !== "EXPENSE") {
      return { error: "Selecciona un tipo válido." };
    }

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
