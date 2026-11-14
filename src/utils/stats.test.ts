import { describe, expect, it } from "vitest";
import { formatNumber, formatPopulation, tripStats } from "./stats";
import type { Trip } from "../types/trip";

function makeTrip(id: string, budget: number, costsPerDay: number[][]): Trip {
  return {
    id,
    name: id,
    destination: "Somewhere",
    startDate: "2027-01-01",
    endDate: "2027-01-02",
    budget,
    days: costsPerDay.map((costs, dayIndex) => ({
      date: `2027-01-0${dayIndex + 1}`,
      activities: costs.map((cost, i) => ({
        id: `${id}-${dayIndex}-${i}`,
        title: "Activity",
        cost,
        category: "activity" as const,
      })),
    })),
    packing: [],
  };
}

describe("tripStats", () => {
  it("is all zeros when there are no trips", () => {
    expect(tripStats([])).toEqual({ trips: 0, days: 0, activities: 0, budget: 0, spent: 0 });
  });

  it("adds up trips, days, activities, budgets and spending", () => {
    const trips = [makeTrip("a", 600, [[20, 8], []]), makeTrip("b", 1800, [[100]])];

    expect(tripStats(trips)).toEqual({
      trips: 2,
      days: 3,
      activities: 3,
      budget: 2400,
      spent: 128,
    });
  });
});

describe("formatNumber", () => {
  it("adds thousands separators", () => {
    expect(formatNumber(2400)).toBe("2,400");
  });

  it("rounds to a whole number", () => {
    expect(formatNumber(12.6)).toBe("13");
  });
});

describe("formatPopulation", () => {
  it("adds thousands separators", () => {
    expect(formatPopulation(517802)).toBe("517,802");
  });

  it("shortens millions", () => {
    expect(formatPopulation(5638830)).toBe("5.6M");
  });

  it("returns an empty string when unknown", () => {
    expect(formatPopulation(undefined)).toBe("");
    expect(formatPopulation(0)).toBe("");
  });
});
