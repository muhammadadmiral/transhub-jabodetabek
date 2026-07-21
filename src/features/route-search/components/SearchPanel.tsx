import { motion } from "motion/react";
import { ArrowUpDown, Clock3, Search } from "lucide-react";
import type { RouteSearchResponse } from "../../../lib/api/routes";
import { LocationField, type LocationAutocompleteModel } from "./LocationField";
import { RouteResults } from "./RouteResults";
import type { RouteCardViewModel } from "../lib/routeViewModel";

export type SearchPanelProps = {
  canSubmit: boolean;
  destinationField: LocationAutocompleteModel;
  isSearching: boolean;
  onHoverCriteria?: (criteria: string | null) => void;
  onSelectCriteria: (criteria: string) => void;
  onSubmit: () => void;
  onSwap: () => void;
  originField: LocationAutocompleteModel;
  routeCards: RouteCardViewModel[];
  routeData?: RouteSearchResponse;
  routeError: Error | null;
  selectedCriteria: string | null;
};

export function hasSearchActivity(props: SearchPanelProps) {
  return Boolean(props.routeData || props.routeError || props.isSearching);
}

export function SearchPanelContent(props: SearchPanelProps) {
  const hasResults = hasSearchActivity(props);

  return (
    <div className="search-panel__content">
      <div className="search-panel__header">
        <div>
          <span className="section-index">Perjalanan</span>
          <h1 id="search-title">Pilih asal dan tujuan</h1>
        </div>
        <button className="time-button" type="button">
          <Clock3 size={15} />
          Sekarang
        </button>
      </div>

      <form className="route-form" onSubmit={(event) => { event.preventDefault(); props.onSubmit(); }}>
        <div className="route-fields">
          <div className="route-rail" aria-hidden="true">
            <span className="route-node route-node--origin" />
            <span className="route-rail__line" />
            <span className="route-node route-node--destination" />
          </div>

          <LocationField field={props.originField} label="Dari" placeholder="Alamat, tempat, halte" />
          <div className="field-divider" />
          <LocationField field={props.destinationField} label="Ke" placeholder="Alamat, tempat, halte" />

          <button className="swap-button" type="button" onClick={props.onSwap} aria-label="Tukar asal dan tujuan">
            <ArrowUpDown size={16} />
          </button>
        </div>

        <motion.button
          className="primary-button"
          type="submit"
          disabled={!props.canSubmit || props.isSearching}
          whileHover={props.canSubmit ? { y: -2, scale: 1.005 } : undefined}
          whileTap={props.canSubmit ? { scale: 0.985 } : undefined}
        >
          <span>{props.isSearching ? "Menyusun rute" : "Cari rute"}</span>
          <span className="primary-button__icon"><Search size={17} /></span>
        </motion.button>
      </form>

      {!hasResults && (
        <div className="mode-list" aria-label="Moda tersedia">
          <span>KRL</span><span>MRT</span><span>LRT</span><span>TransJakarta</span><span>Angkot</span>
        </div>
      )}

      <RouteResults
        cards={props.routeCards}
        hasResponse={Boolean(props.routeData)}
        error={props.routeError}
        isLoading={props.isSearching}
        onHoverCriteria={props.onHoverCriteria}
        onSelectCriteria={props.onSelectCriteria}
        selectedCriteria={props.selectedCriteria}
      />
    </div>
  );
}

export function SearchPanel(props: SearchPanelProps) {
  const hasResults = hasSearchActivity(props);

  return (
    <motion.section
      className={`search-panel${hasResults ? " has-results" : ""}`}
      aria-labelledby="search-title"
      layout
      initial={{ opacity: 0, rotateY: -8, scale: 0.96, x: -24, y: "-50%" }}
      animate={{ opacity: 1, rotateY: 0, scale: 1, x: 0, y: "-50%" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], layout: { duration: 0.42 } }}
    >
      <span className="panel-depth panel-depth--one" aria-hidden="true" />
      <span className="panel-depth panel-depth--two" aria-hidden="true" />
      <SearchPanelContent {...props} />
    </motion.section>
  );
}
