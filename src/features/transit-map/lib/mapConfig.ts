import type { MapOptions } from "maplibre-gl";

export const MAP_STYLE_URL = import.meta.env.VITE_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/liberty";

export const MAP_CONFIG = {
  center: [106.8456, -6.2088],
  zoom: 13.65,
  pitch: 58,
  bearing: -18,
  minZoom: 9,
  maxZoom: 18,
  maxPitch: 70,
  maxBounds: [[106.35, -6.85], [107.35, -5.85]],
  renderWorldCopies: false,
  attributionControl: { compact: true },
  canvasContextAttributes: { antialias: true },
} satisfies Omit<MapOptions, "container" | "style">;
