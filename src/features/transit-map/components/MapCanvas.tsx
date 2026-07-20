import "maplibre-gl/dist/maplibre-gl.css";
import { useTransitMap } from "../hooks/useTransitMap";

export function MapCanvas() {
  const { containerRef, hasError, isLoading } = useTransitMap();

  return (
    <div className="map-canvas" aria-label="Peta 3D Jabodetabek">
      <div ref={containerRef} className="map-instance" />
      {isLoading && <div className="map-loading"><span /> Memuat peta</div>}
      {hasError && <div className="map-error">Peta tidak dapat dimuat</div>}
    </div>
  );
}
