import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map } from "maplibre-gl";
import { MAP_CONFIG, MAP_STYLE_URL } from "../lib/mapConfig";
import { useMapStore } from "../../../store/mapStore";

function refineThreeDimensionalLayer(map: Map) {
  if (!map.getLayer("building-3d")) return;

  map.setPaintProperty("building-3d", "fill-extrusion-color", [
    "interpolate", ["linear"], ["get", "render_height"],
    0, "#172433",
    45, "#394b59",
    120, "#9a8b70",
  ]);
  map.setPaintProperty("building-3d", "fill-extrusion-opacity", 0.72);
  map.setPaintProperty("building-3d", "fill-extrusion-vertical-gradient", true);
}

export function useTransitMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      ...MAP_CONFIG,
    });

    mapRef.current = map;
    useMapStore.getState().registerMap(map);

    map.once("load", () => {
      refineThreeDimensionalLayer(map);
      setIsLoading(false);
    });
    map.on("error", () => {
      if (!map.loaded()) setHasError(true);
    });

    return () => {
      useMapStore.getState().registerMap(null);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return { containerRef, hasError, isLoading };
}
