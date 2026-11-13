import { describe, expect, it } from "vitest";
import {
  budgetPercent,
  isOverBudget,
  remainingBudget,
  spendingByCategory,
  totalSpent,
} from "./budget";
import type { Trip } from "../types/trip";

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: "t",
    name: "Test trip",
    destination: "Somewhere",
    startDate: "2027-01-01",
    endDate: "2027-01-03",
    budget: 100,
    days: [
      {
        date: "2027-01-01",
        activities: [
          { id: "a1", title: "Train", cost: 30, category: "transport" },
          { id: "a2", title: "Dinner", cost: 20, category: "food" },
        ],
      },
      {
        date: "2027-01-02",
        activities: [{ id: "a3", title: "Museum", cost: 10, category: "activity" }],
      },
    ],
    packing: [],
    ...overrides,
  };
}

describe("totalSpent", () => {
  it("sums activity costs across all days", () => {
    expect(totalSpent(makeTrip())).toBe(60);
  });

  it("returns 0 for a trip with no days", () => {
    expect(totalSpent(makeTrip({ days: [] }))).toBe(0);
  });

  it("returns 0 for days with no activities", () => {
    expect(totalSpent(makeTrip({ days: [{ date: "2027-01-01", activities: [] }] }))).toBe(0);
  });
});

describe("remainingBudget", () => {
  it("subtracts spending from the budget", () => {
    expect(remainingBudget(makeTrip())).toBe(40);
  });

  it("is zero when spending exactly matches the budget", () => {
    expect(remainingBudget(makeTrip({ budget: 60 }))).toBe(0);
  });

  it("is negative when over budget", () => {
    expect(remainingBudget(makeTrip({ budget: 50 }))).toBe(-10);
  });
});

describe("isOverBudget", () => {
  it("is false when under budget", () => {
    expect(isOverBudget(makeTrip())).toBe(false);
  });

  it("is false when spending exactly equals the budget", () => {
    expect(isOverBudget(makeTrip({ budget: 60 }))).toBe(false);
  });

  it("is true when spending exceeds the budget", () => {
    expect(isOverBudget(makeTrip({ budget: 59 }))).toBe(true);
  });
});

describe("spendingByCategory", () => {
  it("totals each category and includes zero entries", () => {
    expect(spendingByCategory(makeTrip())).toEqual({
      food: 20,
      transport: 30,
      stay: 0,
      activity: 10,
    });
  });

  it("adds up to the same figure as totalSpent", () => {
    const trip = makeTrip();
    const byCategory = spendingByCategory(trip);
    const sum = Object.values(byCategory).reduce((a, b) => a + b, 0);
    expect(sum).toBe(totalSpent(trip));
  });
});

describe("budgetPercent", () => {
  it("returns the share of the budget that is spent", () => {
    expect(budgetPercent(25, 100)).toBe(25);
  });

  it("caps at 100 when over budget", () => {
    expect(budgetPercent(250, 100)).toBe(100);
  });

  it("returns 0 when nothing is spent", () => {
    expect(budgetPercent(0, 100)).toBe(0);
  });

  it("returns 0 instead of dividing by zero when the budget is zero", () => {
    expect(budgetPercent(50, 0)).toBe(0);
  });
});
