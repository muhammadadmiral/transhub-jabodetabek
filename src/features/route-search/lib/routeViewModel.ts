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

export type RouteCardViewModel = {
  assumptions: string[];
  criteria: "fastest" | "cheapest";
  criteriaLabel: string;
  durationLabel: string;
  fareComponents: Array<{
    amount: string;
    id: string;
    model: string;
    serviceName: string;
    status: string;
  }>;
  fareLabel: string;
  fareStatus: string;
  hasCommunityData: boolean;
  id: string;
  modesLabel: string;
  segments: Array<{
    color: string;
    confidence: string;
    duration: string;
    fare: string;
    from: string;
    id: string;
    lastVerifiedAt: string;
    mode: string;
    routeId: string;
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
      .map((segment) => segment.serviceName)
      .filter((value, index, list) => list.indexOf(value) === index);

    return {
      assumptions: option.fareQuote.assumptions ?? [],
      criteria: option.criteria,
      criteriaLabel: isCombined ? "Tercepat & termurah" : option.criteria === "fastest" ? "Tercepat" : "Termurah",
      durationLabel: String(Math.round(option.totalDurationMin)),
      fareComponents: option.fareQuote.components.map((component) => ({
        amount: component.status === "range"
          ? `${rupiah.format(component.minAmount)}–${rupiah.format(component.maxAmount).replace("Rp", "")}`
          : rupiah.format(component.estimatedAmount),
        id: component.fareProductId,
        model: component.model,
        serviceName: component.serviceName,
        status: component.status,
      })),
      fareLabel: formatFareQuote(option.fareQuote),
      fareStatus: option.fareQuote.status,
      hasCommunityData: option.segments.some((segment) => segment.dataConfidence === "community"),
      id: `${option.criteria}-${option.segments.map((segment) => segment.id).join("-")}`,
      modesLabel: serviceNames.join(" → "),
      segments: option.segments.map((segment) => ({
        color: `#${segment.color.replace(/^#/, "")}`,
        confidence: segment.dataConfidence,
        duration: `${Math.round(segment.avgDurationMin)} menit`,
        fare: rupiah.format(segment.fare),
        from: readableStopId(segment.fromStopId),
        id: segment.id,
        lastVerifiedAt: segment.lastVerifiedAt,
        mode: segment.mode,
        routeId: segment.routeId,
        serviceCategory: segment.serviceCategory,
        serviceName: segment.serviceName,
        to: readableStopId(segment.toStopId),
      })),
      transferLabel: `${option.transferCount}× pindah`,
    };
  });
}
