import { Icon } from "../../../components/Icon";

export type SearchPanelProps = {
  canSubmit: boolean;
  destination: string;
  isSearching: boolean;
  origin: string;
  onDestinationChange: (value: string) => void;
  onOriginChange: (value: string) => void;
  onSubmit: () => void;
  onSwap: () => void;
};

export function SearchPanel({
  canSubmit,
  destination,
  isSearching,
  origin,
  onDestinationChange,
  onOriginChange,
  onSubmit,
  onSwap,
}: SearchPanelProps) {
  return (
    <section className="search-panel" aria-labelledby="search-title">
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

          <label className="location-field">
            <span className="field-label">Dari</span>
            <input value={origin} onChange={(event) => onOriginChange(event.target.value)} placeholder="Stasiun, halte, atau lokasi" autoComplete="off" />
          </label>

          <div className="field-divider" />

          <label className="location-field">
            <span className="field-label">Ke</span>
            <input value={destination} onChange={(event) => onDestinationChange(event.target.value)} placeholder="Tujuan perjalanan" autoComplete="off" />
          </label>

          <button className="swap-button" type="button" onClick={onSwap} aria-label="Tukar asal dan tujuan">
            <Icon name="swap" size={18} />
          </button>
        </div>

        <button className="primary-button" type="submit" disabled={!canSubmit || isSearching}>
          <span>{isSearching ? "Mencari" : "Cari rute"}</span>
          <span className="primary-button__icon"><Icon name="arrow" size={19} /></span>
        </button>
      </form>

      <div className="mode-list" aria-label="Moda tersedia">
        <span>KRL</span><span>MRT</span><span>LRT</span><span>TransJakarta</span><span>Angkot</span>
      </div>
    </section>
  );
}
