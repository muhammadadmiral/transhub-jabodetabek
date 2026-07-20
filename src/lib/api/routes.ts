import type { components } from "./generated/schema";
import { apiRequest } from "./client";

export type RouteSearchInput = components["schemas"]["RouteSearchRequest"];
export type RouteSearchResponse = components["schemas"]["RouteSearchResponse"];
export type RouteOption = components["schemas"]["RouteOption"];
export type FareQuote = components["schemas"]["FareQuote"];

export function searchRoutes(input: RouteSearchInput, signal?: AbortSignal) {
  return apiRequest<RouteSearchResponse>("/route-search", {
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
    method: "POST",
    signal,
  });
}
