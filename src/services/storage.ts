import type { Trip } from "../types/trip";

export const TRIPS_STORAGE_KEY = "itinera.trips";

/**
 * Minimal shape check for stored data. It guards against hand-edited or
 * outdated entries; it is not a full schema validation.
 */
function isTrip(value: unknown): value is Trip {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Trip>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    Array.isArray(candidate.days)
  );
}

/**
 * Reads saved trips. Returns null when nothing usable is stored, so the caller
 * can fall back to its default data. Never throws.
 */
export function loadTrips(storage: Storage = window.localStorage): Trip[] | null {
  try {
    const raw = storage.getItem(TRIPS_STORAGE_KEY);
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    return parsed.filter(isTrip);
  } catch {
    // Storage can be blocked, or the stored JSON can be corrupt.
    return null;
  }
}

/** Saves trips. Fails silently if storage is full or unavailable, so the app keeps working in memory. */
export function saveTrips(trips: Trip[], storage: Storage = window.localStorage): void {
  try {
    storage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  } catch {
    // Quota exceeded or storage blocked. The trips stay in memory for this session.
  }
}
