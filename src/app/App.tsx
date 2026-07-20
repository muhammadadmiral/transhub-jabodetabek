import { lazy, Suspense } from "react";
import { Brand } from "../components/Brand";
import { RouteSearch } from "../features/route-search/components/RouteSearch";
import { MapActionButtons } from "../features/transit-map/components/MapActionButtons";
import { MapControls } from "../features/transit-map/components/MapControls";
import { MapStatus } from "../features/transit-map/components/MapStatus";
import { JourneyProvider } from "../features/route-search/JourneyContext";
import { useMapStore } from "../store/mapStore";

const MapCanvas = lazy(() => import("../features/transit-map/components/MapCanvas"));

export function App() {
  const pinMode = useMapStore((state) => state.pinMode);
  return (
    <JourneyProvider>
    <main className={`app-shell${pinMode ? " is-pinning" : ""}`}>
      <Suspense fallback={<div className="map-canvas"><div className="map-loading"><span /> Memuat peta</div></div>}>
        <MapCanvas />
      </Suspense>
      <div className="map-shade" aria-hidden="true" />

      <header className="topbar">
        <Brand />
        <MapActionButtons />
      </header>

      <RouteSearch />
      <MapControls />

      <MapStatus />
    </main>
    </JourneyProvider>
  );
}
