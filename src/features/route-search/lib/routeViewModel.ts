import type { RouteSearchResponse } from "../../../lib/api/routes";
import { formatFareQuote } from "../../../lib/formatFareQuote";

export type RouteCardViewModel = {
  criteriaLabel: string;
  durationLabel: string;
  fareLabel: string;
  hasCommunityData: boolean;
  id: string;
  modesLabel: string;
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
      criteriaLabel: isCombined
        ? "Tercepat & termurah"
        : option.criteria === "fastest" ? "Tercepat" : "Termurah",
      durationLabel: String(Math.round(option.totalDurationMin)),
      fareLabel: formatFareQuote(option.fareQuote),
      hasCommunityData: option.segments.some((segment) => segment.dataConfidence === "community"),
      id: `${option.criteria}-${option.segments.map((segment) => segment.id).join("-")}`,
      modesLabel: serviceNames.join(" → "),
      transferLabel: `${option.transferCount}× pindah`,
    };
  });
}
