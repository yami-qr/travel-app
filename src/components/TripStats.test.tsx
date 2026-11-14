import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import TripStats from "./TripStats";
import { sampleTrips } from "../data/sampleTrips";

afterEach(cleanup);

/** The value shown next to a label in the stat tiles. */
function valueFor(label: string) {
  return screen.getByText(label).parentElement?.querySelector("dd")?.textContent;
}

describe("TripStats", () => {
  it("shows totals across all trips", () => {
    render(<TripStats trips={sampleTrips} />);

    expect(valueFor("Trips planned")).toBe("2");
    // Lisbon has 4 days and Kyoto has 8.
    expect(valueFor("Days on the road")).toBe("12");
    expect(valueFor("Activities lined up")).toBe("2");
    expect(valueFor("Spent of total budget")).toBe("28 / 2,400");
  });

  it("shows zeros when there are no trips", () => {
    render(<TripStats trips={[]} />);

    expect(valueFor("Trips planned")).toBe("0");
    expect(valueFor("Spent of total budget")).toBe("0 / 0");
  });
});
