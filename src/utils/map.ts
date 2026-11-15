import type { AttractionCategory } from "../services/api/wikipedia";

export interface LatLng {
  latitude: number;
  longitude: number;
}

/** [[south, west], [north, east]], the shape Leaflet's fitBounds expects. */
export type Bounds = [[number, number], [number, number]];

/**
 * The smallest box that holds every point, padded so markers are not cut off
 * at the edge. A single point gets a small box around it, since a box with no
 * size would zoom the map in as far as it goes.
 */
export function boundsFor(points: LatLng[], padding = 0.002): Bounds | null {
  if (points.length === 0) return null;

  let south = Infinity;
  let west = Infinity;
  let north = -Infinity;
  let east = -Infinity;

  for (const { latitude, longitude } of points) {
    south = Math.min(south, latitude);
    north = Math.max(north, latitude);
    west = Math.min(west, longitude);
    east = Math.max(east, longitude);
  }

  return [
    [south - padding, west - padding],
    [north + padding, east + padding],
  ];
}

/** Marker colour per sight category, matching the palette in styles/base.css. */
export const categoryColours: Record<AttractionCategory, string> = {
  history: "#c4412a",
  religious: "#7a4fa3",
  museum: "#1f4e6b",
  nature: "#4f7d61",
  culture: "#d48a1c",
  landmark: "#b5466b",
  neighbourhood: "#5b6270",
};
