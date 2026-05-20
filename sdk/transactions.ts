import { javaFetch } from "@/sdk/_http";
import { throwJavaApiErrorFromResponse } from "@/sdk/_errors";
import type {
  CreateTransactionPayload,
  PageResponse,
  Transaction,
  TransactionListParams,
} from "@/types/transaction";

function buildQuery(params: TransactionListParams): string {
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.categoryId) search.set("categoryId", params.categoryId);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.size !== undefined) search.set("size", String(params.size));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getTransactions(
  token: string,
  params: TransactionListParams = {},
): Promise<PageResponse<Transaction>> {
  const res = await javaFetch(`/transactions${buildQuery(params)}`, { token });

  if (!res.ok) {
    await throwJavaApiErrorFromResponse(res, "Error al cargar transacciones");
  }

  return res.json() as Promise<PageResponse<Transaction>>;
}

export async function createTransaction(
  token: string,
  payload: CreateTransactionPayload,
): Promise<Transaction> {
  const res = await javaFetch("/transactions", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    await throwJavaApiErrorFromResponse(res, "Error al crear la transacción");
  }

  return res.json() as Promise<Transaction>;
}
