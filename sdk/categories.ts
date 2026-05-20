import { javaFetch } from "@/sdk/_http";
import { throwJavaApiErrorFromResponse } from "@/sdk/_errors";
import type { Category } from "@/types/category";

export async function getCategories(token: string): Promise<Category[]> {
  const res = await javaFetch("/categories", { token });
  if (!res.ok) await throwJavaApiErrorFromResponse(res, "Failed to load categories");
  return res.json() as Promise<Category[]>;
}
