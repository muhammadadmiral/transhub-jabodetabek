import "maplibre-gl/dist/maplibre-gl.css";
import { useTransitMap } from "../hooks/useTransitMap";
import { useMapStore } from "../../../store/mapStore";

export default function MapCanvas() {
  const { confirmCenterPin, containerRef, hasError, isLoading, pinMode, retry } = useTransitMap();

  return (
    <div className="map-canvas" aria-label="Peta 3D Jabodetabek">
      <div ref={containerRef} className="map-instance" />
      {isLoading && !hasError && <div className="map-loading"><span /> Memuat peta</div>}
      {hasError && (
        <div className="map-error">
          <span>Peta tidak dapat dimuat</span>
          <button type="button" onClick={retry}>Coba lagi</button>
        </div>
      )}
      {pinMode && (
        <div className="pin-placement" role="dialog" aria-label="Pilih titik di peta">
          <div className={`pin-crosshair pin-crosshair--${pinMode}`}><span /></div>
          <div className="pin-placement__bar">
            <button type="button" onClick={() => useMapStore.getState().cancelPinPlacement()}>Batal</button>
            <span>Geser peta ke titik {pinMode === "origin" ? "asal" : "tujuan"}</span>
            <button type="button" onClick={confirmCenterPin}>Gunakan titik</button>
          </div>
        </div>
      )}
    </div>
  );
}
