import { lazy, Suspense, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Brand } from "../components/Brand";
import { RouteSearch } from "../features/route-search/components/RouteSearch";
import { MapActionButtons } from "../features/transit-map/components/MapActionButtons";
import { MapControls } from "../features/transit-map/components/MapControls";
import { MapStatus } from "../features/transit-map/components/MapStatus";
import { JourneyProvider } from "../features/route-search/JourneyContext";
import { useMapStore } from "../store/mapStore";

gsap.registerPlugin(useGSAP);

const MapCanvas = lazy(() => import("../features/transit-map/components/MapCanvas"));

export function App() {
  const pinMode = useMapStore((state) => state.pinMode);
  const shellRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".topbar", { autoAlpha: 0, y: -22, duration: 0.7, delay: 0.15 })
      .from(".map-status", { autoAlpha: 0, y: 10, duration: 0.5 }, "-=0.35")
      .from(".map-controls", { autoAlpha: 0, x: 14, duration: 0.5 }, "-=0.4");
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

      <MapStatus />
    </main>
    </JourneyProvider>
  );
}
