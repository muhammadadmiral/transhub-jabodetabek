import type { components } from "./generated/schema";
import { apiRequest } from "./client";

export type TransitStop = components["schemas"]["Stop"];
export type TransportMode = components["schemas"]["TransportMode"];

export function searchStops(query: string, signal?: AbortSignal) {
  const search = new URLSearchParams({ q: query, limit: "12" });
  return apiRequest<TransitStop[]>(`/stops?${search}`, { signal });
}
