import { useMapStore } from "../../../store/mapStore";

export function MapStatus() {
  const isThreeDimensional = useMapStore((state) => state.isThreeDimensional);

  return (
    <div className="map-status" aria-label="Status peta">
      <span className="map-status__pulse" />
      <span>{isThreeDimensional ? "3D" : "2D"}</span>
      <span className="map-status__divider" />
      <span>Jakarta</span>
    </div>
  );
}
