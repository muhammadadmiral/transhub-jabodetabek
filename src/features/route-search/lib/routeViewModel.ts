import type { RouteSearchResponse } from "../../../lib/api/routes";
import { formatFareQuote } from "../../../lib/formatFareQuote";

const rupiah = new Intl.NumberFormat("id-ID", {
  currency: "IDR",
  maximumFractionDigits: 0,
  style: "currency",
});

function readableStopId(id: string) {
  return id.split(":").at(-1)?.replaceAll("-", " ") || id;
}

const readableValue = (value: string) => value.replaceAll("_", " ");
const readableMode = (value: string) => value === "jaklingko"
  ? "Mikrotrans"
  : value === "ride_hail" ? "Ojek online" : readableValue(value);

function readableDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}

function formatDistance(meters: number | null | undefined) {
  if (typeof meters !== "number") return "Jarak belum tersedia";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} km`;
}

export type RouteCardViewModel = {
  assumptions: string[];
  criteria: "fastest" | "cheapest";
  criteriaLabel: string;
  durationLabel: string;
  durationMin: number;
  fareComponents: Array<{
    amount: string;
    id: string;
    model: string;
    serviceName: string;
    sourceUrl: string | null;
    status: string;
  }>;
  fareLabel: string;
  fareStatus: string;
  hasCommunityData: boolean;
  id: string;
  modesLabel: string;
  quoteMeta: string;
  totalDistanceLabel: string;
  segments: Array<{
    color: string;
    confidence: string;
    duration: string;
    distance: string;
    fare: string;
    from: string;
    id: string;
    lastVerifiedAt: string;
    mode: string;
    fareProductId: string | null;
    instruction: string | null;
    routeId: string;
    routeCode: string;
    routeName: string;
    scheduleSourceUrl: string | null;
    scheduledWait: string | null;
    trafficNote: string | null;
    weatherNote: string | null;
    serviceCategory: string;
    serviceName: string;
    to: string;
  }>;
  transferLabel: string;
};

export function createRouteCards(data?: RouteSearchResponse): RouteCardViewModel[] {
  if (!data) return [];

  const signatures = new Set<string>();
  const uniqueOptions = data.options.filter((option) => {
    const signature = option.segments.map((segment) => segment.id).join("|");
    if (signatures.has(signature)) return false;
    signatures.add(signature);
    return true;
  });
  const isCombined = data.options.length === 2 && uniqueOptions.length === 1;

  return uniqueOptions.map((option) => {
    const serviceNames = option.segments
      .map((segment) => segment.mode === "walk"
        ? "Jalan kaki"
        : `${segment.routeCode} · ${segment.routeName}`)
      .filter((value, index, list) => list.indexOf(value) === index);

    return {
      assumptions: option.fareQuote.assumptions ?? [],
      criteria: option.criteria,
      criteriaLabel: isCombined ? "Tercepat & termurah" : option.criteria === "fastest" ? "Tercepat" : "Termurah",
      durationLabel: String(Math.round(option.totalDurationMin)),
      durationMin: Math.round(option.totalDurationMin),
      fareComponents: option.fareQuote.components.map((component) => ({
        amount: component.status === "range"
          ? `${rupiah.format(component.minAmount)}–${rupiah.format(component.maxAmount).replace("Rp", "")}`
          : rupiah.format(component.estimatedAmount),
        id: component.fareProductId,
        model: readableValue(component.model),
        serviceName: component.serviceName,
        sourceUrl: component.sourceUrl ?? null,
        status: readableValue(component.status),
      })),
      fareLabel: formatFareQuote(option.fareQuote),
      fareStatus: readableValue(option.fareQuote.status),
      hasCommunityData: option.segments.some((segment) => segment.dataConfidence === "community"),
      id: `${option.criteria}-${option.segments.map((segment) => segment.id).join("-")}`,
      modesLabel: serviceNames.join(" → "),
      quoteMeta: `${readableValue(option.fareQuote.paymentProfile)} · ${option.fareQuote.currency}`,
      totalDistanceLabel: formatDistance(option.totalDistanceMeters),
      segments: option.segments.map((segment) => {
        const fromLabel = segment.fromStopName?.trim() || readableStopId(segment.fromStopId);
        const toLabel = segment.toStopName?.trim() || readableStopId(segment.toStopId);
        return {
          color: `#${segment.color.replace(/^#/, "")}`,
          confidence: readableValue(segment.dataConfidence),
          duration: `${Math.round(segment.avgDurationMin + segment.scheduledWaitMin)} menit`,
          distance: formatDistance(segment.distanceMeters),
          fare: rupiah.format(segment.fare),
          from: fromLabel,
          id: segment.id,
          fareProductId: segment.fareProductId ?? null,
          instruction: segment.instruction ?? null,
          lastVerifiedAt: readableDate(segment.lastVerifiedAt),
          mode: readableMode(segment.mode),
          routeId: segment.routeId,
          routeCode: segment.routeCode,
          routeName: segment.routeName,
          scheduleSourceUrl: segment.scheduleSourceUrl ?? null,
          scheduledWait: segment.scheduledWaitMin > 0
            ? `Termasuk ±${segment.scheduledWaitMin.toFixed(1)} menit waktu tunggu terjadwal`
            : null,
          trafficNote: segment.trafficSource === "live_tomtom"
            ? `ETA lalu lintas aktual · TomTom · ${segment.trafficFactor?.toFixed(2)}× baseline historis`
            : segment.trafficSource === "live_google"
              ? `ETA lalu lintas aktual · Google Routes · ${segment.trafficFactor?.toFixed(2)}× baseline historis`
            : segment.trafficSource === "historical_profile"
              ? `ETA memakai profil lalu lintas waktu setempat · ${segment.trafficFactor?.toFixed(2)}×`
              : null,
          weatherNote: segment.weatherSource === "open_meteo"
            ? segment.precipitationMm && segment.precipitationMm >= 0.2
              ? `ETA jalan disesuaikan hujan · ${segment.precipitationMm.toFixed(1)} mm · Open-Meteo`
              : "Cuaca saat ini tidak menambah ETA · Open-Meteo"
            : null,
          serviceCategory: readableValue(segment.serviceCategory),
          serviceName: segment.serviceName,
          to: toLabel,
        };
      }),
      transferLabel: `${option.transferCount}× pindah`,
    };
  });
}
