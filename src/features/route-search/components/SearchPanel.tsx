import type { RouteSearchResponse } from "../../../lib/api/routes";
import { Icon } from "../../../components/Icon";
import { LocationField, type StopAutocompleteModel } from "./LocationField";
import { RouteResults } from "./RouteResults";
import type { RouteCardViewModel } from "../lib/routeViewModel";

export type SearchPanelProps = {
  canSubmit: boolean;
  destinationField: StopAutocompleteModel;
  isSearching: boolean;
  onSubmit: () => void;
  onSwap: () => void;
  originField: StopAutocompleteModel;
  routeData?: RouteSearchResponse;
  routeCards: RouteCardViewModel[];
  routeError: Error | null;
};

export function SearchPanel({
  canSubmit,
  destinationField,
  isSearching,
  onSubmit,
  onSwap,
  originField,
  routeData,
  routeCards,
  routeError,
}: SearchPanelProps) {
  return (
    <section className={`search-panel${routeData || routeError || isSearching ? " has-results" : ""}`} aria-labelledby="search-title">
      <div className="search-panel__header">
        <div>
          <span className="section-index">01</span>
          <h1 id="search-title">Rencanakan perjalanan</h1>
        </div>
        <button className="time-button" type="button">
          <Icon name="clock" size={16} />
          Sekarang
        </button>
      </div>

      <form className="route-form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
        <div className="route-fields">
          <div className="route-rail" aria-hidden="true">
            <span className="route-node route-node--origin" />
            <span className="route-rail__line" />
            <span className="route-node route-node--destination" />
          </div>

          <LocationField field={originField} label="Dari" placeholder="Cari halte atau stasiun" />
          <div className="field-divider" />
          <LocationField field={destinationField} label="Ke" placeholder="Cari halte atau stasiun" />

          <button className="swap-button" type="button" onClick={onSwap} aria-label="Tukar asal dan tujuan">
            <Icon name="swap" size={18} />
          </button>
        </div>

        <button className="primary-button" type="submit" disabled={!canSubmit || isSearching}>
          <span>{isSearching ? "Mencari rute" : "Cari rute"}</span>
          <span className="primary-button__icon"><Icon name="arrow" size={19} /></span>
        </button>
      </form>

      {!routeData && !routeError && !isSearching && (
        <div className="mode-list" aria-label="Moda tersedia">
          <span>KRL</span><span>MRT</span><span>LRT</span><span>TransJakarta</span><span>Angkot</span>
        </div>
      )}

      <RouteResults cards={routeCards} hasResponse={Boolean(routeData)} error={routeError} isLoading={isSearching} />
    </section>
  );
}
