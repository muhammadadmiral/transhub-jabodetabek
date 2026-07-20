import { Icon } from "../../../components/Icon";
import { useMapStore } from "../../../store/mapStore";

export function MapControls() {
  const zoomIn = useMapStore((state) => state.zoomIn);
  const zoomOut = useMapStore((state) => state.zoomOut);

  return (
    <div className="map-controls" aria-label="Kontrol peta">
      <button type="button" onClick={zoomIn} aria-label="Perbesar peta"><Icon name="plus" /></button>
      <span />
      <button type="button" onClick={zoomOut} aria-label="Perkecil peta"><Icon name="minus" /></button>
    </div>
  );
}
