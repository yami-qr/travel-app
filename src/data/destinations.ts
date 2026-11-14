import type { ScenePalette, SceneVariant } from "../components/Scenery";

export interface Destination {
  id: string;
  /** City or area, e.g. "Lisbon". */
  name: string;
  country: string;
  scene: SceneVariant;
  palette: ScenePalette;
}

/** Suggested places to plan a trip to, each with its own illustrated scene. */
export const destinations: Destination[] = [
  {
    id: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    scene: "coast",
    palette: {
      skyTop: "#ffb38a",
      skyBottom: "#ffe1b8",
      sun: "#fff6d6",
      far: "#e27d60",
      mid: "#3f8fb5",
      near: "#b9503c",
    },
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    scene: "peaks",
    palette: {
      skyTop: "#ffc2d6",
      skyBottom: "#ffeef3",
      sun: "#ff7fa3",
      far: "#b78aa6",
      mid: "#8a4f70",
      near: "#58304a",
    },
  },
  {
    id: "ubud",
    name: "Ubud",
    country: "Indonesia",
    scene: "dunes",
    palette: {
      skyTop: "#a8dcf5",
      skyBottom: "#e4f8f4",
      sun: "#ffd766",
      far: "#7fcf9f",
      mid: "#3f9a6c",
      near: "#1d5a3c",
    },
  },
  {
    id: "santorini",
    name: "Santorini",
    country: "Greece",
    scene: "coast",
    palette: {
      skyTop: "#8fc8ff",
      skyBottom: "#e2f2ff",
      sun: "#ffffff",
      far: "#c9dff3",
      mid: "#1f6fbd",
      near: "#f4f8fb",
    },
  },
  {
    id: "reykjavik",
    name: "Reykjavik",
    country: "Iceland",
    scene: "peaks",
    palette: {
      skyTop: "#173a4d",
      skyBottom: "#3f84a8",
      sun: "#a9f3d2",
      far: "#cfe6ee",
      mid: "#6f9fb1",
      near: "#234a5c",
    },
  },
  {
    id: "marrakech",
    name: "Marrakech",
    country: "Morocco",
    scene: "dunes",
    palette: {
      skyTop: "#ffb347",
      skyBottom: "#ffe0ad",
      sun: "#fff3c9",
      far: "#e8944a",
      mid: "#c9641f",
      near: "#8c3f12",
    },
  },
  {
    id: "banff",
    name: "Banff",
    country: "Canada",
    scene: "peaks",
    palette: {
      skyTop: "#86c5e3",
      skyBottom: "#dcf2fa",
      sun: "#ffffff",
      far: "#5b7895",
      mid: "#2c726c",
      near: "#17504b",
    },
  },
  {
    id: "ha-long-bay",
    name: "Ha Long Bay",
    country: "Vietnam",
    scene: "islands",
    palette: {
      skyTop: "#aee6d3",
      skyBottom: "#e9f9f2",
      sun: "#ffe9a6",
      far: "#3d8d79",
      mid: "#62c0ae",
      near: "#1e5e51",
    },
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    scene: "coast",
    palette: {
      skyTop: "#ff9e9e",
      skyBottom: "#ffd9ad",
      sun: "#fff4dc",
      far: "#70597d",
      mid: "#37527a",
      near: "#2a2c44",
    },
  },
  {
    id: "cusco",
    name: "Cusco",
    country: "Peru",
    scene: "peaks",
    palette: {
      skyTop: "#c9b0dd",
      skyBottom: "#f5ebff",
      sun: "#ffe066",
      far: "#8069a6",
      mid: "#6a9a50",
      near: "#386641",
    },
  },
];

/** Full label used to pre-fill the trip form, e.g. "Lisbon, Portugal". */
export function destinationLabel(destination: Destination): string {
  return `${destination.name}, ${destination.country}`;
}

/**
 * Picks the scene for a trip's destination text. A known place or country gets
 * its own scene; anything else gets a stable pick, so a trip always looks the same.
 */
export function sceneForDestination(text: string): Destination {
  const lower = text.toLowerCase();
  const match = destinations.find(
    (d) => lower.includes(d.name.toLowerCase()) || lower.includes(d.country.toLowerCase()),
  );
  if (match) return match;

  let hash = 0;
  for (const char of lower) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  }
  return destinations[hash % destinations.length];
}
