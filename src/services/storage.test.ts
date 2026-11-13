import { beforeEach, describe, expect, it } from "vitest";
import { loadTrips, saveTrips, TRIPS_STORAGE_KEY } from "./storage";
import type { Trip } from "../types/trip";

/** In-memory stand-in for window.localStorage, so tests don't depend on jsdom state. */
class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.data.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value));
  }
}

/** Storage that throws on every call, like a blocked or full localStorage. */
const brokenStorage: Storage = {
  length: 0,
  clear() {
    throw new Error("blocked");
  },
  getItem() {
    throw new Error("blocked");
  },
  key() {
    throw new Error("blocked");
  },
  removeItem() {
    throw new Error("blocked");
  },
  setItem() {
    throw new Error("quota exceeded");
  },
};

const sampleTrip: Trip = {
  id: "trip-1",
  name: "Lisbon weekend",
  destination: "Lisbon, Portugal",
  startDate: "2027-03-12",
  endDate: "2027-03-15",
  budget: 600,
  days: [],
  packing: [],
};

let storage: MemoryStorage;

beforeEach(() => {
  storage = new MemoryStorage();
});

describe("saveTrips and loadTrips", () => {
  it("round-trips trips through storage", () => {
    saveTrips([sampleTrip], storage);
    expect(loadTrips(storage)).toEqual([sampleTrip]);
  });

  it("saves an empty list, so deleting every trip stays deleted", () => {
    saveTrips([], storage);
    expect(loadTrips(storage)).toEqual([]);
  });

  it("returns null when nothing has been saved yet", () => {
    expect(loadTrips(storage)).toBeNull();
  });

  it("returns null when the stored data is not valid JSON", () => {
    storage.setItem(TRIPS_STORAGE_KEY, "{not json");
    expect(loadTrips(storage)).toBeNull();
  });

  it("returns null when the stored value is not an array", () => {
    storage.setItem(TRIPS_STORAGE_KEY, JSON.stringify({ trips: [] }));
    expect(loadTrips(storage)).toBeNull();
  });

  it("drops stored entries that do not look like trips", () => {
    storage.setItem(
      TRIPS_STORAGE_KEY,
      JSON.stringify([sampleTrip, { foo: "bar" }, null, "trip", { id: 1, name: "x", days: [] }]),
    );
    expect(loadTrips(storage)).toEqual([sampleTrip]);
  });

  it("does not throw when storage is blocked", () => {
    expect(() => saveTrips([sampleTrip], brokenStorage)).not.toThrow();
    expect(loadTrips(brokenStorage)).toBeNull();
  });
});
