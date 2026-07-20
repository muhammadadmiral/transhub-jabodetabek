import type { components } from "./generated/schema";
import { apiRequest } from "./client";

export type NearbyStop = components["schemas"]["NearbyStop"];
export type NearbyStopPurpose = components["schemas"]["NearbyStopPurpose"];

export type NearbyStopsInput = {
  lat: number;
  lng: number;
  purpose: NearbyStopPurpose;
  radiusMeters?: number;
};

export function getNearbyStops(input: NearbyStopsInput, signal?: AbortSignal) {
  const search = new URLSearchParams({
    lat: input.lat.toFixed(5),
    limit: "10",
    lng: input.lng.toFixed(5),
    purpose: input.purpose,
    radiusMeters: String(input.radiusMeters ?? 1000),
  });
  return apiRequest<NearbyStop[]>(`/stops/nearby?${search}`, { signal });
}
