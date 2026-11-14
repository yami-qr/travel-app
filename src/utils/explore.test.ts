import { describe, expect, it } from "vitest";
import { countriesIn, defaultFilters, filterAndSortPlaces } from "./explore";
import type { Place } from "../services/api/places";

function place(id: number, name: string, country: string, featureCode: string, population?: number): Place {
  return { id, name, country, countryCode: "", latitude: 0, longitude: 0, featureCode, population };
}

const results: Place[] = [
  place(1, "Lisbon", "Portugal", "PPLC", 517802),
  place(2, "Lisbon", "United States", "PPLA2", 2727),
  place(3, "Lisbon Island", "Canada", "ISL"),
  place(4, "Abrantes", "Portugal", "PPL", 18000),
];

describe("filterAndSortPlaces", () => {
  it("keeps everything in API order by default", () => {
    expect(filterAndSortPlaces(results, defaultFilters).map((p) => p.id)).toEqual([1, 2, 3, 4]);
  });

  it("keeps only populated places for 'cities'", () => {
    const ids = filterAndSortPlaces(results, { ...defaultFilters, kind: "cities" }).map((p) => p.id);
    expect(ids).toEqual([1, 2, 4]);
  });

  it("keeps only national capitals for 'capitals'", () => {
    const ids = filterAndSortPlaces(results, { ...defaultFilters, kind: "capitals" }).map((p) => p.id);
    expect(ids).toEqual([1]);
  });

  it("filters by country", () => {
    const ids = filterAndSortPlaces(results, { ...defaultFilters, country: "Portugal" }).map((p) => p.id);
    expect(ids).toEqual([1, 4]);
  });

  it("sorts by population, largest first, with unknown populations last", () => {
    const ids = filterAndSortPlaces(results, { ...defaultFilters, sort: "population" }).map((p) => p.id);
    expect(ids).toEqual([1, 4, 2, 3]);
  });

  it("sorts by name, then country", () => {
    const names = filterAndSortPlaces(results, { ...defaultFilters, sort: "name" }).map(
      (p) => `${p.name}/${p.country}`,
    );
    expect(names).toEqual(["Abrantes/Portugal", "Lisbon/Portugal", "Lisbon/United States", "Lisbon Island/Canada"]);
  });

  it("does not change the array it was given", () => {
    const copy = [...results];
    filterAndSortPlaces(results, { ...defaultFilters, sort: "name" });
    expect(results).toEqual(copy);
  });
});

describe("countriesIn", () => {
  it("lists each country once, alphabetically", () => {
    expect(countriesIn(results)).toEqual(["Canada", "Portugal", "United States"]);
  });
});
