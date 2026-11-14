import type { Place } from "../services/api/places";

export type PlaceKind = "all" | "cities" | "capitals";
export type PlaceSort = "relevance" | "population" | "name";

export interface PlaceFilters {
  kind: PlaceKind;
  /** Country name, or "" for every country. */
  country: string;
  sort: PlaceSort;
}

export const defaultFilters: PlaceFilters = { kind: "all", country: "", sort: "relevance" };

/** GeoNames feature codes starting with PPL are populated places: cities, towns, villages. */
function isCity(place: Place): boolean {
  return place.featureCode?.startsWith("PPL") ?? false;
}

/** National capitals. */
function isCapital(place: Place): boolean {
  return place.featureCode === "PPLC";
}

/** Applies the kind and country filters, then sorts. Returns a new array. */
export function filterAndSortPlaces(places: Place[], filters: PlaceFilters): Place[] {
  const filtered = places.filter((place) => {
    if (filters.kind === "cities" && !isCity(place)) return false;
    if (filters.kind === "capitals" && !isCapital(place)) return false;
    if (filters.country && place.country !== filters.country) return false;
    return true;
  });

  if (filters.sort === "population") {
    return [...filtered].sort((a, b) => (b.population ?? 0) - (a.population ?? 0));
  }
  if (filters.sort === "name") {
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name) || a.country.localeCompare(b.country));
  }
  // "relevance" keeps the order the search API returned.
  return filtered;
}

/** The distinct countries in a result list, alphabetically, for the country filter. */
export function countriesIn(places: Place[]): string[] {
  return [...new Set(places.map((p) => p.country).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
