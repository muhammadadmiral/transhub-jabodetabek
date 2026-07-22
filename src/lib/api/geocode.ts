import type { components } from "./generated/schema";
import { apiRequest } from "./client";

export type PlaceResult = components["schemas"]["PlaceResult"];

export async function searchPlaces(query: string, signal?: AbortSignal) {
  const search = new URLSearchParams({ q: query });
  return apiRequest<PlaceResult[]>(`/geocode/search?${search}`, { signal });
}

export async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal) {
  const search = new URLSearchParams({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
  return apiRequest<PlaceResult>(`/geocode/reverse?${search}`, { signal });
}
