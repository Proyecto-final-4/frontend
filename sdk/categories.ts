import { javaFetch } from "@/sdk/_http";
import { throwJavaApiError } from "@/sdk/_errors";
import type { Category } from "@/types/category";

export async function getCategories(token: string): Promise<Category[]> {
  const res = await javaFetch("/categories", { token });
  if (!res.ok) throwJavaApiError(await res.text(), "Error al cargar categorias");
  return res.json() as Promise<Category[]>;
}
