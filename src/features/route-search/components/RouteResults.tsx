import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import NumberFlow from "@number-flow/react";
import { ChevronDown, Clock3, Database, ExternalLink, ShieldCheck, Users, WalletCards } from "lucide-react";
import { ApiError } from "../../../lib/api/errors";
import { cn } from "../../../lib/cn";
import type { RouteCardViewModel } from "../lib/routeViewModel";

type RouteResultsProps = {
  cards: RouteCardViewModel[];
  error: Error | null;
  hasResponse: boolean;
  isLoading: boolean;
  onHoverCriteria?: (criteria: string | null) => void;
  onSelectCriteria: (criteria: string) => void;
  selectedCriteria: string | null;
};

const CRITERIA_LINE: Record<string, { className: string; label: string }> = {
  cheapest: { className: "route-card__line-chip--mint", label: "garis hijau di peta" },
  fastest: { className: "route-card__line-chip--gold", label: "garis emas di peta" },
};

export function RouteResults({ cards, error, hasResponse, isLoading, onHoverCriteria, onSelectCriteria, selectedCriteria }: RouteResultsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    <motion.div className="route-results" layout aria-live="polite">
      <div className="route-results__heading"><span>Opsi perjalanan</span><small>{cards.length} opsi</small></div>
      <div className="route-card-list">
        {cards.map((card, index) => {
          const isSelected = selectedCriteria === card.criteria || (!selectedCriteria && index === 0);
          const isExpanded = expandedId === card.id;
          return (
            <motion.article
              className={cn("route-card", isSelected && "is-selected")}
              key={card.id}
              layout
              initial={{ opacity: 0, y: 18, rotateX: -8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: index * 0.08, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onSelectCriteria(card.criteria)}
              onMouseEnter={() => onHoverCriteria?.(card.criteria)}
              onMouseLeave={() => onHoverCriteria?.(null)}
            >
              <div className="route-card__meta">
                <span>{card.criteriaLabel}</span>
                <span className={cn("route-card__line-chip", CRITERIA_LINE[card.criteria]?.className)}>
                  <span aria-hidden="true" />
                  {CRITERIA_LINE[card.criteria]?.label}
                </span>
                <small>{card.transferLabel}</small>
              </div>
              <div className="route-card__figures">
                <strong><NumberFlow value={card.durationMin} /> <small>menit</small></strong>
                <strong>{card.fareLabel}</strong>
              </div>
              <div className="route-card__modes">{card.modesLabel}</div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {card.hasCommunityData ? <span className="community-badge"><Users size={10} /> Data komunitas</span> : <span className="official-badge"><ShieldCheck size={10} /> Data resmi</span>}
                  <span className="fare-status"><WalletCards size={10} /> {card.fareStatus}</span>
                </div>
                <button
                  className="grid size-8 place-items-center rounded-lg border border-white/8 bg-white/[0.035] text-white/55 transition hover:text-white"
                  type="button"
                  aria-expanded={isExpanded}
                  aria-label="Lihat rincian perjalanan"
                  onClick={(event) => { event.stopPropagation(); setExpandedId(isExpanded ? null : card.id); }}
                >
                  <ChevronDown size={15} className={cn("transition-transform", isExpanded && "rotate-180")} />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    className="route-detail"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="detail-section">
                      <div className="detail-title"><Clock3 size={13} /> Segmen perjalanan</div>
                      <div className="segment-timeline">
                        {card.segments.map((segment) => (
                          <div className="segment-row" key={segment.id}>
                            <span className="segment-line" style={{ backgroundColor: segment.color }} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <strong>{segment.mode === "walk" ? "Jalan kaki" : `${segment.routeCode || segment.serviceName}`}</strong>
                                <small>{segment.duration}</small>
                              </div>
                              <p className="segment-stops">
                                <span>{segment.from}</span>
                                <span className="segment-stops__arrow" aria-hidden="true">→</span>
                                <span>{segment.to}</span>
                              </p>
                              {(segment.fromCoordinate || segment.toCoordinate) && (
                                <p className="segment-coords">
                                  {segment.fromCoordinate ?? segment.toCoordinate}
                                </p>
                              )}
                              <div className="segment-meta">
                                <span>{segment.mode}</span><span>{segment.serviceCategory}</span><span>{segment.fare}</span>
                                <span>{segment.confidence}</span><span>{segment.lastVerifiedAt}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {card.fareComponents.length > 0 && (
                      <div className="detail-section">
                        <div className="detail-title"><WalletCards size={13} /> Rincian tarif <small>{card.quoteMeta}</small></div>
                        {card.fareComponents.map((component) => (
                          <div className="fare-component" key={component.id}>
                            <span>
                              <strong>{component.serviceName}</strong>
                              <small>{component.model} · {component.status} · {component.id}</small>
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              <strong>{component.amount}</strong>
                              {component.sourceUrl && (
                                <a href={component.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Sumber tarif ${component.serviceName}`}>
                                  <ExternalLink size={11} />
                                </a>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {card.assumptions.length > 0 && (
                      <div className="detail-section">
                        <div className="detail-title"><Database size={13} /> Asumsi tarif</div>
                        <ul className="assumption-list">{card.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </div>
    </motion.div>
  );
}
