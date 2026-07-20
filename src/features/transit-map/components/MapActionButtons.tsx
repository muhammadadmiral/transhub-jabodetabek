import { Icon } from "../../../components/Icon";
import { useMapStore } from "../../../store/mapStore";

export function MapActionButtons() {
  const isThreeDimensional = useMapStore((state) => state.isThreeDimensional);
  const locateUser = useMapStore((state) => state.locateUser);
  const toggleThreeDimensional = useMapStore((state) => state.toggleThreeDimensional);

  return (
    <div className="topbar__actions">
      <button className={`glass-button glass-button--label${isThreeDimensional ? " is-active" : ""}`} type="button" onClick={toggleThreeDimensional} aria-pressed={isThreeDimensional}>
        <Icon name="layers" />
        <span>3D</span>
      </button>
      <button className="glass-button" type="button" onClick={locateUser} aria-label="Lokasi saya">
        <Icon name="locate" />
      </button>
    </div>
  );
}
