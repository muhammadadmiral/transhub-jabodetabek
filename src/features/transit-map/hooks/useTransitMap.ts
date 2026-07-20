import { useEffect, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type Map, type Marker } from "maplibre-gl";
import gsap from "gsap";
import { MAP_CONFIG, MAP_STYLE_URL } from "../lib/mapConfig";
import { useMapStore } from "../../../store/mapStore";
import { useSearchStore, type LocationKind, type LocationSelection } from "../../../store/searchStore";
import { useJourney } from "../../route-search/JourneyContext";

function refineThreeDimensionalLayer(map: Map) {
  if (!map.getLayer("building-3d")) return;
  map.setLayerZoomRange("building-3d", 14.2, 24);
  map.setPaintProperty("building-3d", "fill-extrusion-color", [
    "interpolate", ["linear"], ["get", "render_height"],
    0, "#16222f",
    24, "#243746",
    60, "#3d5162",
    120, "#8a7c60",
    220, "#c8ad72",
  ]);
  map.setPaintProperty("building-3d", "fill-extrusion-opacity", [
    "interpolate", ["linear"], ["zoom"],
    14.2, 0,
    15.2, 0.62,
    16.5, 0.86,
  ]);
  map.setPaintProperty("building-3d", "fill-extrusion-vertical-gradient", true);
  map.setLight({ anchor: "viewport", color: "#f4e9c8", intensity: 0.32, position: [1.2, 210, 32] });
}

function applyAtmosphere(map: Map) {
  try {
    map.setSky({
      "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 9, 0.35, 13, 0.12, 15, 0],
      "fog-color": "#0a141f",
      "fog-ground-blend": 0.82,
      "horizon-color": "#1c2c3d",
      "horizon-fog-blend": 0.6,
      "sky-color": "#050b12",
      "sky-horizon-blend": 0.7,
    });
  } catch {
    // Style belum mendukung properti sky — abaikan.
  }
}

function playIntroFlight(map: Map) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const target = {
    bearing: MAP_CONFIG.bearing,
    center: MAP_CONFIG.center as [number, number],
    pitch: isMobile ? 52 : MAP_CONFIG.pitch,
    zoom: isMobile ? 13.1 : MAP_CONFIG.zoom,
  };
  map.jumpTo({ ...target, bearing: target.bearing + 36, pitch: 0, zoom: target.zoom - 1.9 });
  map.easeTo({ ...target, duration: 2600, easing: (t) => 1 - Math.pow(1 - t, 3) });
}

function getSelectionCoordinate(selection: LocationSelection) {
  if (selection.kind === "transit-stop") return { lat: selection.stop.lat, lng: selection.stop.lng };
  if (selection.kind === "pin") return selection.coordinate;
  return null;
}

function createMarkerElement(kind: LocationKind) {
  const element = document.createElement("div");
  element.className = `map-pin map-pin--${kind}`;
  const core = document.createElement("span");
  const label = document.createElement("small");
  label.textContent = kind === "origin" ? "A" : "B";
  element.append(core, label);
  return element;
}

function getGeoJsonBounds(featureCollection: GeoJSON.FeatureCollection) {
  const bounds = new maplibregl.LngLatBounds();
  const visit = (coordinates: unknown) => {
    if (!Array.isArray(coordinates)) return;
    if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
      bounds.extend([coordinates[0], coordinates[1]] as [number, number]);
      return;
    }
    coordinates.forEach(visit);
  };
  featureCollection.features.forEach((feature) => visit(feature.geometry && "coordinates" in feature.geometry ? feature.geometry.coordinates : []));
  return bounds;
}

function ensureRouteLayers(map: Map, data: GeoJSON.FeatureCollection) {
  if (!map.getSource("active-journey")) {
    map.addSource("active-journey", { data, type: "geojson" });
    map.addLayer({
      id: "active-journey-casing",
      source: "active-journey",
      type: "line",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "rgba(4, 10, 16, 0.88)",
        "line-opacity": 0.95,
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, 5, 15, 11],
      },
    });
    map.addLayer({
      id: "active-journey-line",
      source: "active-journey",
      type: "line",
      filter: ["!=", ["get", "mode"], "walk"],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": ["coalesce", ["get", "color"], "#e9cc75"],
        "line-opacity": 1,
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, 2.5, 15, 6],
      },
    });
    map.addLayer({
      id: "active-journey-walk",
      source: "active-journey",
      type: "line",
      filter: ["==", ["get", "mode"], "walk"],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": ["coalesce", ["get", "color"], "#94a3b8"],
        "line-dasharray": [1.2, 1.5],
        "line-opacity": 0.9,
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, 2, 15, 4],
      },
    });
  }
}

function getAccessConnectors(origin: LocationSelection, destination: LocationSelection): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  const addConnector = (kind: LocationKind, selection: LocationSelection) => {
    if (selection.kind !== "pin" || !selection.selectedStop) return;
    const stop = selection.selectedStop;
    features.push({
      geometry: {
        coordinates: kind === "origin"
          ? [[selection.coordinate.lng, selection.coordinate.lat], [stop.lng, stop.lat]]
          : [[stop.lng, stop.lat], [selection.coordinate.lng, selection.coordinate.lat]],
        type: "LineString",
      },
      properties: { distanceMeters: stop.distanceMeters, kind },
      type: "Feature",
    });
  };
  addConnector("origin", origin);
  addConnector("destination", destination);
  return { features, type: "FeatureCollection" };
}

function ensureConnectorLayer(map: Map, data: GeoJSON.FeatureCollection) {
  if (map.getSource("access-connectors")) return;
  map.addSource("access-connectors", { data, type: "geojson" });
  map.addLayer({
    id: "access-connectors-line",
    source: "access-connectors",
    type: "line",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": ["match", ["get", "kind"], "origin", "#e9cc75", "#8bd9bf"],
      "line-dasharray": [1, 1.6],
      "line-opacity": 0.9,
      "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 16, 3.5],
    },
  });
}

export function useTransitMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Partial<Record<LocationKind, Marker>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const originSelection = useSearchStore((state) => state.originSelection);
  const destinationSelection = useSearchStore((state) => state.destinationSelection);
  const pinMode = useMapStore((state) => state.pinMode);
  const { selectedOption } = useJourney();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      ...MAP_CONFIG,
    });
    const loadTimeout = window.setTimeout(() => {
      if (!map.isStyleLoaded()) {
        setHasError(true);
        setIsLoading(false);
      }
    }, 15_000);
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    mapRef.current = map;
    useMapStore.getState().registerMap(map);

    map.once("load", () => {
      window.clearTimeout(loadTimeout);
      refineThreeDimensionalLayer(map);
      applyAtmosphere(map);
      map.resize();
      playIntroFlight(map);
      setIsLoading(false);
      setHasError(false);
    });
    map.on("click", (event) => {
      const activeMode = useMapStore.getState().pinMode;
      if (!activeMode || window.matchMedia("(max-width: 760px)").matches) return;
      useSearchStore.getState().setPin(activeMode, { lat: event.lngLat.lat, lng: event.lngLat.lng });
      useMapStore.getState().cancelPinPlacement();
    });
    map.on("error", (event) => {
      if (!map.loaded() && !map.isStyleLoaded()) {
        console.error("Map load error:", event.error);
      }
    });

    return () => {
      window.clearTimeout(loadTimeout);
      resizeObserver.disconnect();
      Object.values(markersRef.current).forEach((marker) => marker?.remove());
      markersRef.current = {};
      useMapStore.getState().registerMap(null);
      map.remove();
      mapRef.current = null;
    };
  }, [attempt]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const syncMarker = (kind: LocationKind, selection: LocationSelection) => {
      const coordinate = getSelectionCoordinate(selection);
      const currentMarker = markersRef.current[kind];
      if (!coordinate) {
        currentMarker?.remove();
        delete markersRef.current[kind];
        return;
      }

      const marker = currentMarker || new maplibregl.Marker({
        draggable: selection.kind === "pin",
        element: createMarkerElement(kind),
        pitchAlignment: "map",
      });

      marker.setLngLat([coordinate.lng, coordinate.lat]);
      if (!currentMarker) marker.addTo(map);
      marker.setDraggable(selection.kind === "pin");
      if (!currentMarker) {
        marker.on("dragend", () => {
          const position = marker.getLngLat();
          const current = kind === "origin"
            ? useSearchStore.getState().originSelection
            : useSearchStore.getState().destinationSelection;
          const label = current.kind === "pin" ? current.label : "Titik di peta";
          useSearchStore.getState().setPin(kind, { lat: position.lat, lng: position.lng }, label);
        });
      }
      markersRef.current[kind] = marker;
    };

    syncMarker("origin", originSelection);
    syncMarker("destination", destinationSelection);
  }, [destinationSelection, originSelection]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || isLoading || !map.isStyleLoaded()) return;
    const data = getAccessConnectors(originSelection, destinationSelection);
    ensureConnectorLayer(map, data);
    (map.getSource("access-connectors") as GeoJSONSource).setData(data);
  }, [destinationSelection, isLoading, originSelection]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || isLoading || !map.isStyleLoaded()) return;
    const empty: GeoJSON.FeatureCollection = { features: [], type: "FeatureCollection" };
    ensureRouteLayers(map, empty);
    const source = map.getSource("active-journey") as GeoJSONSource;

    if (!selectedOption) {
      source.setData(empty);
      return;
    }

    const data = selectedOption.geojson as unknown as GeoJSON.FeatureCollection;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animation: gsap.core.Tween | undefined;
    if (prefersReducedMotion || data.features.length < 2) {
      source.setData(data);
    } else {
      const progress = { value: 0 };
      animation = gsap.to(progress, {
        duration: Math.min(1.8, 0.65 + data.features.length * 0.018),
        ease: "power2.out",
        onUpdate: () => {
          source.setData({ ...data, features: data.features.slice(0, Math.max(1, Math.ceil(progress.value))) });
        },
        value: data.features.length,
      });
    }

    const bounds = getGeoJsonBounds(data);
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        bearing: -10,
        duration: prefersReducedMotion ? 0 : 850,
        maxZoom: 15.5,
        padding: window.innerWidth <= 760
          ? { bottom: 360, left: 36, right: 36, top: 110 }
          : { bottom: 80, left: 500, right: 80, top: 90 },
        pitch: 38,
      });
    }
    return () => {
      animation?.kill();
    };
  }, [isLoading, selectedOption]);

  function confirmCenterPin() {
    const map = mapRef.current;
    const activeMode = useMapStore.getState().pinMode;
    if (!map || !activeMode) return;
    const center = map.getCenter();
    useSearchStore.getState().setPin(activeMode, { lat: center.lat, lng: center.lng });
    useMapStore.getState().cancelPinPlacement();
  }

  function retry() {
    setHasError(false);
    setIsLoading(true);
    setAttempt((current) => current + 1);
  }

  return { confirmCenterPin, containerRef, hasError, isLoading, pinMode, retry };
}
