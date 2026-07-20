export type PlaceResult = {
  area: string;
  category: string;
  id: string;
  label: string;
  lat: number;
  lng: number;
  subtitle: string;
};

export async function searchPlaces(query: string, signal?: AbortSignal) {
  const search = new URLSearchParams({ q: query });
  const response = await fetch(`/api/geocode?${search}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error("Pencarian lokasi gagal");
  const body = await response.json() as Array<PlaceResult | {
    address?: Record<string, string>;
    category?: string;
    display_name: string;
    lat: string;
    lon: string;
    name?: string;
    place_id: number;
    type?: string;
  }>;

  return body.map((result) => {
    if ("label" in result) return result;
    return {
      area: result.address?.city || result.address?.town || result.address?.county || result.address?.state || "Indonesia",
      category: result.type || result.category || "place",
      id: String(result.place_id),
      label: result.name || result.display_name.split(",")[0],
      lat: Number(result.lat),
      lng: Number(result.lon),
      subtitle: result.display_name,
    };
  });
}
