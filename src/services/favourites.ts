import type { Place } from "./api/places";

export const FAVOURITES_STORAGE_KEY = "travel-planner.favourites";

/** What is stored for a favourite: enough to show a card and open its page without another request. */
export type FavouritePlace = Pick<
  Place,
  "id" | "name" | "country" | "countryCode" | "region" | "latitude" | "longitude"
> & {
  /** When it was saved, as an ISO timestamp. Newest favourites are shown first. */
  savedAt: string;
};

function isFavourite(value: unknown): value is FavouritePlace {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Partial<FavouritePlace>;
  return (
    typeof v.id === "number" &&
    typeof v.name === "string" &&
    typeof v.latitude === "number" &&
    typeof v.longitude === "number"
  );
}

/** Reads saved favourites. Returns an empty list when nothing usable is stored. Never throws. */
export function loadFavourites(storage: Storage = window.localStorage): FavouritePlace[] {
  try {
    const raw = storage.getItem(FAVOURITES_STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isFavourite) : [];
  } catch {
    return [];
  }
}

export function saveFavourites(
  favourites: FavouritePlace[],
  storage: Storage = window.localStorage,
): void {
  try {
    storage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(favourites));
  } catch {
    // Storage full or blocked: favourites stay in memory for this visit.
  }
}

/** Adds the place if it is not a favourite yet, or removes it if it is. Returns a new list. */
export function toggleFavourite(
  favourites: FavouritePlace[],
  place: Omit<FavouritePlace, "savedAt">,
  now: Date = new Date(),
): FavouritePlace[] {
  if (favourites.some((f) => f.id === place.id)) {
    return favourites.filter((f) => f.id !== place.id);
  }
  const favourite: FavouritePlace = {
    id: place.id,
    name: place.name,
    country: place.country,
    countryCode: place.countryCode,
    region: place.region,
    latitude: place.latitude,
    longitude: place.longitude,
    savedAt: now.toISOString(),
  };
  return [favourite, ...favourites];
}
