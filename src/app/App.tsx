import { Brand } from "../components/Brand";
import { RouteSearch } from "../features/route-search/components/RouteSearch";
import { MapCanvas } from "../features/transit-map/components/MapCanvas";
import { MapActionButtons } from "../features/transit-map/components/MapActionButtons";
import { MapControls } from "../features/transit-map/components/MapControls";
import { MapStatus } from "../features/transit-map/components/MapStatus";

export function App() {
  return (
    <main className="app-shell">
      <MapCanvas />
      <div className="map-shade" aria-hidden="true" />

      <header className="topbar">
        <Brand />
        <MapActionButtons />
      </header>

      <RouteSearch />
      <MapControls />

      <MapStatus />
    </main>
  );
}
