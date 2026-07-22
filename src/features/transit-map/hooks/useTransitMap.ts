import { useEffect, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type Map, type Marker } from "maplibre-gl";
import gsap from "gsap";
import { MAP_CONFIG, MAP_STYLE_URL } from "../lib/mapConfig";
import { useMapStore } from "../../../store/mapStore";
import { useSearchStore, type LocationKind, type LocationSelection } from "../../../store/searchStore";
import { useJourney } from "../../route-search/JourneyContext";
import { reverseGeocode } from "../../../lib/api/geocode";

function placeMapPin(kind: LocationKind, coordinate: { lat: number; lng: number }) {
  const store = useSearchStore.getState();
  store.setPin(kind, coordinate, "Titik di peta", "map");
  void reverseGeocode(coordinate.lat, coordinate.lng)
    .then((place) => useSearchStore.getState().updatePinLabel(kind, coordinate, place.label))
    .catch(() => undefined);
}

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

function getRoutePadding() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  if (viewportWidth <= 760) {
    const sheet = document.querySelector<HTMLElement>(".search-sheet");
    const sheetHeight = sheet && !sheet.classList.contains("is-hidden")
      ? Math.min(sheet.getBoundingClientRect().height, viewportHeight * 0.92)
      : 0;
    const side = Math.max(20, Math.min(44, viewportWidth * 0.075));
    return {
      bottom: Math.round(Math.max(90, sheetHeight + 28)),
      left: Math.round(side),
      right: Math.round(side),
      top: Math.round(96 + (window.visualViewport?.offsetTop ?? 0)),
    };
  }

  const panel = document.querySelector<HTMLElement>(".search-panel");
  const panelRight = panel?.getBoundingClientRect().right ?? Math.min(560, viewportWidth * 0.4);
  return {
    bottom: Math.round(Math.max(56, viewportHeight * 0.08)),
    left: Math.round(Math.min(viewportWidth * 0.48, panelRight + 44)),
    right: Math.round(Math.max(56, viewportWidth * 0.055)),
    top: Math.round(Math.max(76, viewportHeight * 0.09)),
  };
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

const CRITERIA_COLORS: Record<string, string> = { cheapest: "#8bd9bf", fastest: "#e9cc75" };
const CRITERIA_LABELS: Record<string, string> = { cheapest: "Termurah", fastest: "Tercepat" };

function ensureRouteLayers(map: Map, data: GeoJSON.FeatureCollection) {
  if (!map.getSource("active-journey")) {
    map.addSource("active-journey", { data, promoteId: "featureId", type: "geojson" });
    map.addLayer({
      id: "active-journey-casing",
      source: "active-journey",
      type: "line",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": ["match", ["get", "criteria"], "fastest", "rgba(233,204,117,.38)", "rgba(139,217,191,.38)"],
        "line-opacity": ["case", ["boolean", ["get", "isSelected"], false], 0.95, 0.45],
        "line-width": [
          "interpolate", ["linear"], ["zoom"],
          9, ["case", ["boolean", ["feature-state", "hover"], false], 8, 6],
          15, ["case", ["boolean", ["feature-state", "hover"], false], 15, 12],
        ],
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
        "line-opacity": [
          "case",
          ["boolean", ["get", "isSelected"], false], 1,
          ["boolean", ["feature-state", "hover"], false], 0.95,
          0.38,
        ],
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
        "line-opacity": ["case", ["boolean", ["get", "isSelected"], false], 0.9, 0.3],
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, 2, 15, 4],
      },
    });
  }
}

type JourneyOptionLike = {
  criteria: string;
  geojson: unknown;
  totalDurationMin: number;
  totalFare: number;
};

function buildJourneyCollection(options: JourneyOptionLike[], selectedCriteria: string | null): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  // Rute terpilih digambar terakhir agar berada di atas.
  const ordered = [...options].sort((a, b) =>
    Number(a.criteria === selectedCriteria) - Number(b.criteria === selectedCriteria));
  ordered.forEach((option) => {
    const collection = option.geojson as GeoJSON.FeatureCollection;
    collection.features.forEach((feature, index) => {
      features.push({
        ...feature,
        properties: {
          ...feature.properties,
          criteria: option.criteria,
          criteriaLabel: CRITERIA_LABELS[option.criteria] ?? option.criteria,
          featureId: `${option.criteria}-${index}`,
          isSelected: option.criteria === selectedCriteria,
          totalDurationMin: Math.round(option.totalDurationMin),
          totalFare: option.totalFare,
        },
      });
    });
  });
  return { features, type: "FeatureCollection" };
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
  const journey = useJourney();
  const { options, selectedCriteria } = journey;
  const journeyRef = useRef(journey);
  journeyRef.current = journey;
  const interactionsBoundRef = useRef(false);

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
      placeMapPin(activeMode, { lat: event.lngLat.lat, lng: event.lngLat.lng });
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
      interactionsBoundRef.current = false;
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
          placeMapPin(kind, { lat: position.lat, lng: position.lng });
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
    const empty: GeoJSON.FeatureCollection = { features: [], type: "FeatureCollection" };
    ensureRouteLayers(map, empty);
    bindJourneyInteractions(map);
    const source = map.getSource("active-journey") as GeoJSONSource;

    if (options.length === 0) {
      source.setData(empty);
      return;
    }

    const data = buildJourneyCollection(options, selectedCriteria);
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
        padding: getRoutePadding(),
        pitch: 38,
      });
    }

    return () => {
      animation?.kill();
    };
  }, [isLoading, options, selectedCriteria]);

  // Hover kartu rute / legenda ikut menonjolkan garis di peta.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || isLoading || !map.getLayer("active-journey-line")) return;
    const hovered = journey.hoveredCriteria;
    map.setPaintProperty("active-journey-line", "line-opacity", [
      "case",
      ...(hovered ? [["==", ["get", "criteria"], hovered], 1] as const : []),
      ["boolean", ["get", "isSelected"], false], 1,
      ["boolean", ["feature-state", "hover"], false], 0.95,
      hovered ? 0.22 : 0.38,
    ]);
  }, [isLoading, journey.hoveredCriteria]);

  function bindJourneyInteractions(map: Map) {
    if (interactionsBoundRef.current) return;
    interactionsBoundRef.current = true;

    const popup = new maplibregl.Popup({
      className: "journey-popup",
      closeButton: false,
      closeOnClick: false,
      maxWidth: "260px",
      offset: 14,
    });
    let hoveredFeatureId: string | number | null = null;

    const clearHover = () => {
      if (hoveredFeatureId !== null) {
        map.setFeatureState({ id: hoveredFeatureId, source: "active-journey" }, { hover: false });
        hoveredFeatureId = null;
      }
      journeyRef.current.setHoveredCriteria(null);
      popup.remove();
      map.getCanvas().style.cursor = "";
    };

    const rupiah = new Intl.NumberFormat("id-ID", { currency: "IDR", maximumFractionDigits: 0, style: "currency" });

    map.on("mousemove", "active-journey-casing", (event) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const props = feature.properties as Record<string, string | number | boolean>;
      if (hoveredFeatureId !== null && hoveredFeatureId !== feature.id) {
        map.setFeatureState({ id: hoveredFeatureId, source: "active-journey" }, { hover: false });
      }
      hoveredFeatureId = feature.id ?? null;
      if (hoveredFeatureId !== null) {
        map.setFeatureState({ id: hoveredFeatureId, source: "active-journey" }, { hover: true });
      }
      journeyRef.current.setHoveredCriteria(String(props.criteria));
      map.getCanvas().style.cursor = "pointer";

      const accent = CRITERIA_COLORS[String(props.criteria)] ?? "#e9cc75";
      const isWalk = props.mode === "walk";
      popup
        .setLngLat(event.lngLat)
        .setHTML(`
          <div class="journey-popup__inner" style="--accent:${accent}">
            <span class="journey-popup__badge">${props.criteriaLabel} · ${props.totalDurationMin} mnt · ${rupiah.format(Number(props.totalFare))}</span>
            <strong>${isWalk ? "Jalan kaki" : props.serviceName ?? props.mode}</strong>
            <small>${String(props.mode).replaceAll("_", " ")} · ±${Math.round(Number(props.avgDurationMin))} menit</small>
          </div>
        `)
        .addTo(map);
    });
    map.on("mouseleave", "active-journey-casing", clearHover);
    map.on("click", "active-journey-casing", (event) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const criteria = String((feature.properties as Record<string, unknown>).criteria);
      journeyRef.current.selectCriteria(criteria);
    });
  }

  function confirmCenterPin() {
    const map = mapRef.current;
    const activeMode = useMapStore.getState().pinMode;
    if (!map || !activeMode) return;
    const center = map.getCenter();
    placeMapPin(activeMode, { lat: center.lat, lng: center.lng });
    useMapStore.getState().cancelPinPlacement();
  }

  function retry() {
    setHasError(false);
    setIsLoading(true);
    setAttempt((current) => current + 1);
  }

  return { confirmCenterPin, containerRef, hasError, isLoading, pinMode, retry };
}
