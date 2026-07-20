type NominatimResult = {
  address?: Record<string, string>;
  category?: string;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  place_id: number;
  type?: string;
};

function toPlaceResult(result: NominatimResult) {
  return {
    area: result.address?.city || result.address?.town || result.address?.county || result.address?.state || "Indonesia",
    category: result.type || result.category || "place",
    id: String(result.place_id),
    label: result.name || result.display_name.split(",")[0],
    lat: Number(result.lat),
    lng: Number(result.lon),
    subtitle: result.display_name,
  };
}

export default {
  async fetch(request: Request) {
    if (request.method !== "GET") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const requestUrl = new URL(request.url);
    const query = requestUrl.searchParams.get("q")?.trim() || "";
    const lat = Number(requestUrl.searchParams.get("lat"));
    const lng = Number(requestUrl.searchParams.get("lng"));
    const isReverse = Number.isFinite(lat) && Number.isFinite(lng);
    const baseUrl = process.env.GEOCODER_BASE_URL?.replace(/\/$/, "");
    const userAgent = process.env.GEOCODER_USER_AGENT;

    if (!isReverse && (query.length < 3 || query.length > 100)) {
      return Response.json({ error: "Query harus 3–100 karakter" }, { status: 422 });
    }
    if (isReverse && (lat < -90 || lat > 90 || lng < -180 || lng > 180)) {
      return Response.json({ error: "Koordinat tidak valid" }, { status: 422 });
    }
    if (!baseUrl || !userAgent) {
      return Response.json({ error: "Geocoder belum dikonfigurasi" }, { status: 503 });
    }

    const upstreamUrl = new URL(`${baseUrl}/${isReverse ? "reverse" : "search"}`);
    if (isReverse) {
      upstreamUrl.searchParams.set("lat", String(lat));
      upstreamUrl.searchParams.set("lon", String(lng));
      upstreamUrl.searchParams.set("zoom", "18");
    } else {
      upstreamUrl.searchParams.set("q", query);
      upstreamUrl.searchParams.set("limit", "6");
      upstreamUrl.searchParams.set("countrycodes", "id");
      upstreamUrl.searchParams.set("viewbox", "106.35,-5.85,107.35,-6.85");
      upstreamUrl.searchParams.set("bounded", "1");
    }
    upstreamUrl.searchParams.set("format", "jsonv2");
    upstreamUrl.searchParams.set("addressdetails", "1");
    upstreamUrl.searchParams.set("accept-language", "id");

    const response = await fetch(upstreamUrl, {
      headers: { Accept: "application/json", "User-Agent": userAgent },
    });
    if (!response.ok) {
      return Response.json({ error: "Geocoder tidak tersedia" }, { status: 502 });
    }

    const payload = await response.json() as NominatimResult | NominatimResult[];
    const body = isReverse
      ? toPlaceResult(payload as NominatimResult)
      : (payload as NominatimResult[]).map(toPlaceResult);

    return Response.json(body, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  },
};
