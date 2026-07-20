import { ApiError } from "../../../lib/api/errors";
import type { RouteCardViewModel } from "../lib/routeViewModel";

type RouteResultsProps = {
  cards: RouteCardViewModel[];
  error: Error | null;
  hasResponse: boolean;
  isLoading: boolean;
};

export function RouteResults({ cards, error, hasResponse, isLoading }: RouteResultsProps) {
  if (isLoading) {
    return <div className="route-feedback" aria-live="polite"><span className="route-loader" /><strong>Menyusun perjalanan</strong><small>Membandingkan waktu dan tarif.</small></div>;
  }

  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return <div className="route-feedback route-feedback--error" role="alert"><strong>{notFound ? "Rute belum terhubung" : "Pencarian rute gagal"}</strong><small>{notFound ? "Pilih halte lain atau ubah tujuan." : "Coba kembali beberapa saat lagi."}</small></div>;
  }

  if (hasResponse && cards.length === 0) {
    return <div className="route-feedback"><strong>Rute tidak tersedia</strong><small>Pilih halte lain.</small></div>;
  }
  if (cards.length === 0) return null;

  return (
    <div className="route-results" aria-live="polite">
      <div className="route-results__heading"><span>Hasil</span><small>{cards.length} opsi</small></div>
      <div className="route-card-list">
        {cards.map((card) => (
          <article className="route-card" key={card.id}>
            <div className="route-card__meta">
              <span>{card.criteriaLabel}</span>
              <small>{card.transferLabel}</small>
            </div>
            <div className="route-card__figures">
              <strong>{card.durationLabel} <small>menit</small></strong>
              <strong>{card.fareLabel}</strong>
            </div>
            <div className="route-card__modes">{card.modesLabel}</div>
            {card.hasCommunityData && <div className="community-badge">Data komunitas</div>}
          </article>
        ))}
      </div>
    </div>
  );
}
