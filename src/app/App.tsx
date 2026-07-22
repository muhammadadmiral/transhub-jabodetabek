import { lazy, Suspense, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Brand } from "../components/Brand";
import { RouteSearch } from "../features/route-search/components/RouteSearch";
import { MapActionButtons } from "../features/transit-map/components/MapActionButtons";
import { MapControls } from "../features/transit-map/components/MapControls";
import { MapLegend } from "../features/transit-map/components/MapLegend";
import { MapStatus } from "../features/transit-map/components/MapStatus";
import { JourneyProvider } from "../features/route-search/JourneyContext";
import { useMapStore } from "../store/mapStore";

gsap.registerPlugin(useGSAP);

const MapCanvas = lazy(() => import("../features/transit-map/components/MapCanvas"));

export function App() {
  const pinMode = useMapStore((state) => state.pinMode);
  const shellRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .from(".topbar", { autoAlpha: 0, y: -18, duration: 0.65, delay: 0.12 })
      .from(".map-status", { autoAlpha: 0, y: 10, duration: 0.45 }, "-=0.4")
      .from(".map-controls", { autoAlpha: 0, x: 14, duration: 0.45 }, "-=0.35");
    return () => timeline.kill();
  }, { scope: shellRef });

  return (
    <JourneyProvider>
    <main ref={shellRef} className={`app-shell${pinMode ? " is-pinning" : ""}`}>
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
      <MapLegend />

      <MapStatus />
    </main>
    </JourneyProvider>
  );
}
