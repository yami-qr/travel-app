import { describe, expect, it } from "vitest";
import {
  addActivity,
  addPackingItem,
  moveActivity,
  removeActivity,
  togglePackingItem,
  validateActivityInput,
  type ActivityFormInput,
} from "./itinerary";
import type { Trip } from "../types/trip";

const validActivity: ActivityFormInput = {
  title: "Museum",
  time: "10:00",
  cost: "12",
  category: "activity",
};

function makeTrip(): Trip {
  return {
    id: "t",
    name: "Test",
    destination: "Somewhere",
    startDate: "2027-01-01",
    endDate: "2027-01-02",
    budget: 100,
    days: [
      {
        date: "2027-01-01",
        activities: [
          { id: "a", title: "A", cost: 1, category: "food" },
          { id: "b", title: "B", cost: 2, category: "food" },
          { id: "c", title: "C", cost: 3, category: "food" },
        ],
      },
      { date: "2027-01-02", activities: [] },
    ],
    packing: [{ id: "p1", label: "Passport", packed: false }],
  };
}

describe("validateActivityInput", () => {
  it("accepts a valid activity", () => {
    expect(validateActivityInput(validActivity)).toEqual({});
  });

  it("accepts an activity with no time", () => {
    expect(validateActivityInput({ ...validActivity, time: "" })).toEqual({});
  });

  it("requires a title", () => {
    expect(validateActivityInput({ ...validActivity, title: "  " }).title).toBeTruthy();
  });

  it("rejects a malformed time", () => {
    expect(validateActivityInput({ ...validActivity, time: "25:00" }).time).toBeTruthy();
    expect(validateActivityInput({ ...validActivity, time: "9am" }).time).toBeTruthy();
  });

  it("accepts a cost of zero", () => {
    expect(validateActivityInput({ ...validActivity, cost: "0" })).toEqual({});
  });

  it("rejects a negative or missing cost", () => {
    expect(validateActivityInput({ ...validActivity, cost: "-1" }).cost).toBeTruthy();
    expect(validateActivityInput({ ...validActivity, cost: "" }).cost).toBeTruthy();
  });
});

describe("addActivity", () => {
  it("appends the activity to the matching day only", () => {
    const trip = addActivity(makeTrip(), "2027-01-02", validActivity, "new");
    expect(trip.days[0].activities).toHaveLength(3);
    expect(trip.days[1].activities).toEqual([
      { id: "new", title: "Museum", time: "10:00", cost: 12, category: "activity" },
    ]);
  });

  it("stores no time when the field is empty", () => {
    const trip = addActivity(makeTrip(), "2027-01-02", { ...validActivity, time: "" }, "new");
    expect(trip.days[1].activities[0].time).toBeUndefined();
  });

  it("does not modify the original trip", () => {
    const original = makeTrip();
    addActivity(original, "2027-01-02", validActivity, "new");
    expect(original.days[1].activities).toHaveLength(0);
  });
});

describe("removeActivity", () => {
  it("removes only the matching activity", () => {
    const trip = removeActivity(makeTrip(), "2027-01-01", "b");
    expect(trip.days[0].activities.map((a) => a.id)).toEqual(["a", "c"]);
  });
});

describe("moveActivity", () => {
  it("moves an activity down", () => {
    const trip = moveActivity(makeTrip(), "2027-01-01", "a", 1);
    expect(trip.days[0].activities.map((a) => a.id)).toEqual(["b", "a", "c"]);
  });

  it("moves an activity up", () => {
    const trip = moveActivity(makeTrip(), "2027-01-01", "c", -1);
    expect(trip.days[0].activities.map((a) => a.id)).toEqual(["a", "c", "b"]);
  });

  it("does nothing when moving the first activity up", () => {
    const trip = moveActivity(makeTrip(), "2027-01-01", "a", -1);
    expect(trip.days[0].activities.map((a) => a.id)).toEqual(["a", "b", "c"]);
  });

  it("does nothing when moving the last activity down", () => {
    const trip = moveActivity(makeTrip(), "2027-01-01", "c", 1);
    expect(trip.days[0].activities.map((a) => a.id)).toEqual(["a", "b", "c"]);
  });
});

describe("packing list", () => {
  it("adds a trimmed packing item as unpacked", () => {
    const trip = addPackingItem(makeTrip(), "  Charger  ", "p2");
    expect(trip.packing[1]).toEqual({ id: "p2", label: "Charger", packed: false });
  });

  it("ignores a blank packing item", () => {
    const original = makeTrip();
    expect(addPackingItem(original, "   ")).toBe(original);
  });

  it("toggles an item's packed state", () => {
    const once = togglePackingItem(makeTrip(), "p1");
    expect(once.packing[0].packed).toBe(true);
    const twice = togglePackingItem(once, "p1");
    expect(twice.packing[0].packed).toBe(false);
  });
});
