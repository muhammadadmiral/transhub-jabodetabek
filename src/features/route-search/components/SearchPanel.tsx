import type { SearchStore } from "../../../store/searchStore";
import { formatSearchLabel } from "../../../lib/formatSearchLabel";

type SearchPanelProps = { search: SearchStore };

export function SearchPanel({ search }: SearchPanelProps) {
  const hasInput = search.origin.trim() !== "" || search.destination.trim() !== "";

  return (
    <section className="search-panel" aria-label="Cari perjalanan">
      <div className="eyebrow">Jelajah Jabodetabek</div>
      <h1>Berangkat ke mana<br /><em>hari ini?</em></h1>
      <p className="intro">Cari rute transportasi publik yang paling masuk akal untuk perjalananmu.</p>
      <div className="search-fields">
        <label className="location-field">
          <span className="location-dot location-dot--origin" />
          <span className="field-content"><span className="field-label">Dari mana?</span><input value={search.origin} onChange={(event) => search.setOrigin(event.target.value)} placeholder="Lokasi awal" /></span>
        </label>
        <div className="field-connector" />
        <label className="location-field">
          <span className="location-dot location-dot--destination" />
          <span className="field-content"><span className="field-label">Ke mana?</span><input value={search.destination} onChange={(event) => search.setDestination(event.target.value)} placeholder="Tujuan perjalanan" /></span>
        </label>
      </div>
      <button className="primary-button" type="button" onClick={search.submit} disabled={!hasInput}>
        {formatSearchLabel(search.isSearching)} <span>→</span>
      </button>
      <div className="panel-footer"><span>●</span> Data jaringan terus diperbarui</div>
    </section>
  );
}
