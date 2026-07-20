import { MapCanvas } from "../features/transit-map/components/MapCanvas";
import { SearchPanel } from "../features/route-search/components/SearchPanel";
import { useSearchStore } from "../store/searchStore";

export function App() {
  const search = useSearchStore();

  return (
    <main className="app-shell">
      <MapCanvas />
      <header className="topbar">
        <div className="brand-mark" aria-label="TransHub Jabodetabek">
          <span className="brand-mark__signal">✦</span>
          <span>Trans<span>Hub</span></span>
        </div>
        <button className="icon-button" type="button" aria-label="Buka pengaturan layer">☷</button>
      </header>
      <SearchPanel search={search} />
    </main>
  );
}
