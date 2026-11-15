import { describe, expect, it } from "vitest";
import { boundsFor, categoryColours } from "./map";
import { attractionCategoryLabels } from "../services/api/wikipedia";

describe("boundsFor", () => {
  it("returns null when there are no points", () => {
    expect(boundsFor([])).toBeNull();
  });

  it("wraps every point, with padding", () => {
    const bounds = boundsFor(
      [
        { latitude: 38.7, longitude: -9.2 },
        { latitude: 38.75, longitude: -9.1 },
        { latitude: 38.72, longitude: -9.15 },
      ],
      0.01,
    );
    expect(bounds?.[0][0]).toBeCloseTo(38.69);
    expect(bounds?.[0][1]).toBeCloseTo(-9.21);
    expect(bounds?.[1][0]).toBeCloseTo(38.76);
    expect(bounds?.[1][1]).toBeCloseTo(-9.09);
  });

  it("gives a single point a small box instead of zero size", () => {
    const bounds = boundsFor([{ latitude: 10, longitude: 20 }], 0.002);
    expect(bounds).toEqual([
      [9.998, 19.998],
      [10.002, 20.002],
    ]);
  });
});

describe("categoryColours", () => {
  it("has a colour for every sight category", () => {
    for (const category of Object.keys(attractionCategoryLabels)) {
      expect(categoryColours).toHaveProperty(category);
    }
  });
});
