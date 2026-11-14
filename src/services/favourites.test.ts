import { beforeEach, describe, expect, it } from "vitest";
import {
  FAVOURITES_STORAGE_KEY,
  loadFavourites,
  saveFavourites,
  toggleFavourite,
  type FavouritePlace,
} from "./favourites";

const lisbon = {
  id: 2267057,
  name: "Lisbon",
  country: "Portugal",
  countryCode: "PT",
  region: "Lisbon District",
  latitude: 38.725,
  longitude: -9.15,
};

const kyoto = {
  id: 1857910,
  name: "Kyoto",
  country: "Japan",
  countryCode: "JP",
  latitude: 35.02,
  longitude: 135.75,
};

const now = new Date("2027-01-01T10:00:00Z");

describe("toggleFavourite", () => {
  it("adds a new favourite to the front with a timestamp", () => {
    const list = toggleFavourite([], lisbon, now);
    expect(list).toEqual([{ ...lisbon, savedAt: "2027-01-01T10:00:00.000Z" }]);

    const two = toggleFavourite(list, kyoto, now);
    expect(two.map((f) => f.name)).toEqual(["Kyoto", "Lisbon"]);
  });

  it("removes a place that is already a favourite", () => {
    const list = toggleFavourite([], lisbon, now);
    expect(toggleFavourite(list, lisbon, now)).toEqual([]);
  });

  it("does not change the list it was given", () => {
    const original: FavouritePlace[] = [];
    toggleFavourite(original, lisbon, now);
    expect(original).toEqual([]);
  });

  it("does not keep extra fields passed in with the place", () => {
    const withExtras = { ...lisbon, population: 500000, timezone: "Europe/Lisbon" };
    const [saved] = toggleFavourite([], withExtras, now);
    expect(saved).not.toHaveProperty("population");
  });
});

describe("loadFavourites and saveFavourites", () => {
  let storage: Storage;

  beforeEach(() => {
    const data = new Map<string, string>();
    storage = {
      get length() {
        return data.size;
      },
      clear: () => data.clear(),
      getItem: (k) => data.get(k) ?? null,
      key: (i) => Array.from(data.keys())[i] ?? null,
      removeItem: (k) => void data.delete(k),
      setItem: (k, v) => void data.set(k, String(v)),
    };
  });

  it("round-trips favourites", () => {
    const list = toggleFavourite([], lisbon, now);
    saveFavourites(list, storage);
    expect(loadFavourites(storage)).toEqual(list);
  });

  it("returns an empty list when nothing is saved", () => {
    expect(loadFavourites(storage)).toEqual([]);
  });

  it("ignores corrupt data and entries that are not places", () => {
    storage.setItem(FAVOURITES_STORAGE_KEY, "{oops");
    expect(loadFavourites(storage)).toEqual([]);

    storage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify([{ ...lisbon, savedAt: "x" }, { id: "1" }, null]));
    expect(loadFavourites(storage).map((f) => f.name)).toEqual(["Lisbon"]);
  });
});
