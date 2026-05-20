import { javaFetch } from "@/sdk/_http";
import { throwJavaApiErrorFromResponse } from "@/sdk/_errors";
import type { SummaryResponse, SummaryTrendsResponse } from "@/types/summary";

export async function getSummary(
  token: string,
  from: string,
  to: string,
): Promise<SummaryResponse> {
  const res = await javaFetch(`/summary?${new URLSearchParams({ from, to })}`, { token });
  if (!res.ok) await throwJavaApiErrorFromResponse(res, "Error al cargar el resumen financiero");
  return res.json() as Promise<SummaryResponse>;
}

export async function getSummaryTrends(
  token: string,
  params: {
    currentFrom: string;
    currentTo: string;
    previousFrom: string;
    previousTo: string;
  },
): Promise<SummaryTrendsResponse> {
  const res = await javaFetch(`/summary/trends?${new URLSearchParams(params)}`, { token });
  if (!res.ok) await throwJavaApiErrorFromResponse(res, "Error al cargar tendencias financieras");
  return res.json() as Promise<SummaryTrendsResponse>;
}
