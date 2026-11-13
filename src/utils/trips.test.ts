import { describe, expect, it } from "vitest";
import {
  createTrip,
  dateRange,
  validateTripInput,
  type TripFormInput,
} from "./trips";

const validInput: TripFormInput = {
  name: "Lisbon weekend",
  destination: "Lisbon, Portugal",
  startDate: "2027-03-12",
  endDate: "2027-03-15",
  budget: "600",
};

describe("validateTripInput", () => {
  it("returns no errors for valid input", () => {
    expect(validateTripInput(validInput)).toEqual({});
  });

  it("requires a name, ignoring spaces", () => {
    expect(validateTripInput({ ...validInput, name: "   " }).name).toBeTruthy();
  });

  it("requires a destination", () => {
    expect(validateTripInput({ ...validInput, destination: "" }).destination).toBeTruthy();
  });

  it("requires both dates", () => {
    const errors = validateTripInput({ ...validInput, startDate: "", endDate: "" });
    expect(errors.startDate).toBeTruthy();
    expect(errors.endDate).toBeTruthy();
  });

  it("rejects an end date before the start date", () => {
    const errors = validateTripInput({ ...validInput, endDate: "2027-03-10" });
    expect(errors.endDate).toBe("The end date can't be before the start date.");
  });

  it("accepts a single-day trip where start and end are the same", () => {
    expect(validateTripInput({ ...validInput, endDate: validInput.startDate })).toEqual({});
  });

  it("rejects a budget of zero", () => {
    expect(validateTripInput({ ...validInput, budget: "0" }).budget).toBeTruthy();
  });

  it("rejects a negative budget", () => {
    expect(validateTripInput({ ...validInput, budget: "-5" }).budget).toBeTruthy();
  });

  it("rejects a budget that is not a number", () => {
    expect(validateTripInput({ ...validInput, budget: "lots" }).budget).toBeTruthy();
  });

  it("rejects an empty budget", () => {
    expect(validateTripInput({ ...validInput, budget: "" }).budget).toBeTruthy();
  });
});

describe("dateRange", () => {
  it("includes both the start and end dates", () => {
    expect(dateRange("2027-03-12", "2027-03-15")).toEqual([
      "2027-03-12",
      "2027-03-13",
      "2027-03-14",
      "2027-03-15",
    ]);
  });

  it("returns one date for a single-day trip", () => {
    expect(dateRange("2027-03-12", "2027-03-12")).toEqual(["2027-03-12"]);
  });

  it("crosses month and year boundaries", () => {
    expect(dateRange("2027-12-31", "2028-01-01")).toEqual(["2027-12-31", "2028-01-01"]);
  });
});

describe("createTrip", () => {
  it("creates one empty day per date in the trip", () => {
    const trip = createTrip(validInput, "fixed-id");
    expect(trip.days).toHaveLength(4);
    expect(trip.days.every((day) => day.activities.length === 0)).toBe(true);
  });

  it("uses the id it is given", () => {
    expect(createTrip(validInput, "fixed-id").id).toBe("fixed-id");
  });

  it("converts the budget to a number", () => {
    expect(createTrip(validInput, "x").budget).toBe(600);
  });

  it("trims the name and destination", () => {
    const trip = createTrip({ ...validInput, name: "  Trip  ", destination: " Rome " }, "x");
    expect(trip.name).toBe("Trip");
    expect(trip.destination).toBe("Rome");
  });

  it("generates a unique id when none is given", () => {
    const a = createTrip(validInput);
    const b = createTrip(validInput);
    expect(a.id).not.toBe(b.id);
  });
});
