import { AnimatePresence, motion } from "motion/react";
import { useJourney } from "../../route-search/JourneyContext";

const LEGEND = [
  { criteria: "fastest", label: "Tercepat" },
  { criteria: "cheapest", label: "Termurah" },
] as const;

export function MapLegend() {
  const { hoveredCriteria, options, selectCriteria, selectedCriteria } = useJourney();
  const visible = options.filter((option) => LEGEND.some((entry) => entry.criteria === option.criteria));

  return (
    <AnimatePresence>
      {visible.length > 0 && (
        <motion.div
          className="map-legend"
          role="group"
          aria-label="Legenda rute"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {LEGEND.filter((entry) => visible.some((option) => option.criteria === entry.criteria)).map((entry) => {
            const option = visible.find((candidate) => candidate.criteria === entry.criteria);
            const isActive = selectedCriteria === entry.criteria;
            const isHovered = hoveredCriteria === entry.criteria;
            return (
              <button
                key={entry.criteria}
                type="button"
                className={`map-legend__item map-legend__item--${entry.criteria}${isActive ? " is-active" : ""}${isHovered ? " is-hovered" : ""}`}
                onClick={() => selectCriteria(entry.criteria)}
                aria-pressed={isActive}
              >
                <span className="map-legend__swatch" aria-hidden="true" />
                <span>{entry.label}</span>
                {option && <small>{Math.round(option.totalDurationMin)} mnt</small>}
              </button>
            );
          })}
          {visible.length === 1 && <span className="map-legend__note">Tercepat = termurah</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
