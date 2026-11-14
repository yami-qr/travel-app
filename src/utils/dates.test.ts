import { describe, expect, it } from "vitest";
import {
  formatDateRange,
  formatDay,
  formatDayNumber,
  formatShortDate,
  formatWeekday,
  tripLength,
} from "./dates";

describe("date formatting", () => {
  it("formats a short date", () => {
    expect(formatShortDate("2027-03-12")).toBe("12 Mar");
  });

  it("formats a day with its weekday", () => {
    expect(formatDay("2027-03-12")).toMatch(/^Friday,? 12 Mar$/);
  });

  it("formats the weekday and day number on their own", () => {
    expect(formatWeekday("2027-03-12")).toBe("Fri");
    expect(formatDayNumber("2027-03-12")).toBe("12");
  });

  it("formats a date range", () => {
    expect(formatDateRange("2027-03-12", "2027-03-15")).toBe("12 Mar – 15 Mar");
  });

  it("adds the year to a range when asked", () => {
    expect(formatDateRange("2027-12-30", "2028-01-02", true)).toBe("30 Dec – 2 Jan 2028");
  });

  it("does not shift the first day of a month", () => {
    expect(formatShortDate("2027-01-01")).toBe("1 Jan");
  });
});

describe("tripLength", () => {
  it("counts both the first and the last day", () => {
    expect(tripLength("2027-03-12", "2027-03-15")).toBe(4);
  });

  it("is 1 for a single-day trip", () => {
    expect(tripLength("2027-03-12", "2027-03-12")).toBe(1);
  });

  it("is 0 when the end is before the start", () => {
    expect(tripLength("2027-03-12", "2027-03-10")).toBe(0);
  });
});
