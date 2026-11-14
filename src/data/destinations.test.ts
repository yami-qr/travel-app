import { describe, expect, it } from "vitest";
import { destinationLabel, destinations, sceneForDestination } from "./destinations";

describe("destinations", () => {
  it("has a unique id for every destination", () => {
    const ids = destinations.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("labels a destination as place then country", () => {
    expect(destinationLabel(destinations[0])).toBe("Lisbon, Portugal");
  });
});

describe("sceneForDestination", () => {
  it("matches a known place, ignoring case", () => {
    expect(sceneForDestination("kyoto, japan").id).toBe("kyoto");
  });

  it("matches on the country when the place is not listed", () => {
    expect(sceneForDestination("Porto, Portugal").id).toBe("lisbon");
  });

  it("gives an unknown destination the same scene every time", () => {
    const first = sceneForDestination("Atlantis");
    const second = sceneForDestination("Atlantis");
    expect(first.id).toBe(second.id);
  });

  it("handles an empty destination", () => {
    expect(destinations).toContain(sceneForDestination(""));
  });
});
