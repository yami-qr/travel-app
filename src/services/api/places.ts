import { ApiError, buildUrl, fetchJson } from "./http";

/** A real place found through the Open-Meteo geocoding API. */
export interface Place {
  /** GeoNames id. Stable, so it is used in the destination page URL. */
  id: number;
  name: string;
  country: string;
  countryCode: string;
  /** State, province or region, when known. */
  region?: string;
  latitude: number;
  longitude: number;
  population?: number;
  timezone?: string;
  /** GeoNames feature code, e.g. "PPLC" for a capital city. */
  featureCode?: string;
}

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  population?: number;
  timezone?: string;
  feature_code?: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

const SEARCH_URL = "https://geocoding-api.open-meteo.com/v1/search";
const GET_URL = "https://geocoding-api.open-meteo.com/v1/get";

export function toPlace(result: GeocodingResult): Place {
  return {
    id: result.id,
    name: result.name,
    country: result.country ?? "",
    countryCode: result.country_code ?? "",
    region: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
    population: result.population,
    timezone: result.timezone,
    featureCode: result.feature_code,
  };
}

/** Searches cities and towns by name. Open-Meteo needs at least 2 characters. */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const name = query.trim();
  if (name.length < 2) return [];

  const url = buildUrl(SEARCH_URL, { name, count: 20, language: "en", format: "json" });
  const data = await fetchJson<GeocodingResponse>(url, { signal });
  return (data.results ?? []).map(toPlace);
}

/** Looks up one place by its GeoNames id. */
export async function getPlace(id: number, signal?: AbortSignal): Promise<Place> {
  const url = buildUrl(GET_URL, { id, language: "en", format: "json" });
  try {
    const data = await fetchJson<GeocodingResult>(url, { signal, ttl: 60 * 60 * 1000 });
    return toPlace(data);
  } catch (error) {
    // Open-Meteo answers an unknown id with 400 "Location ID not found", so report it as not found.
    if (error instanceof ApiError && error.status === 400) {
      throw new ApiError("We couldn't find that.", 404);
    }
    throw error;
  }
}

/** "Lisbon, Portugal", or "Springfield, Illinois, United States" when a region helps. */
export function placeLabel(place: Pick<Place, "name" | "country">): string {
  return place.country ? `${place.name}, ${place.country}` : place.name;
}
