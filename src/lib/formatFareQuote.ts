import type { FareQuote } from "./api/routes";

const currency = new Intl.NumberFormat("id-ID", {
  currency: "IDR",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatFareQuote(fare: FareQuote) {
  if (fare.status === "range") {
    return `${currency.format(fare.minAmount)}–${currency.format(fare.maxAmount).replace("Rp", "")}`;
  }
  if (fare.status === "unknown") return "Tarif belum tersedia";
  const amount = currency.format(fare.estimatedAmount);
  return fare.status === "estimated" ? `± ${amount}` : amount;
}
