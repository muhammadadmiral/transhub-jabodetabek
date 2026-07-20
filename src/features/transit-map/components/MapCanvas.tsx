export function MapCanvas() {
  return (
    <div className="map-canvas" role="img" aria-label="Peta jaringan transportasi Jabodetabek">
      <div className="map-grid" />
      <div className="map-water" />
      <div className="route route--red" /><div className="route route--yellow" /><div className="route route--blue" /><div className="route route--green" />
      <span className="map-label map-label--north">JAKARTA UTARA</span><span className="map-label map-label--center">JAKARTA PUSAT</span><span className="map-label map-label--south">DEPOK</span><span className="map-label map-label--east">BEKASI</span>
      <div className="map-credit">© OpenStreetMap contributors · OpenFreeMap</div>
    </div>
  );
}
