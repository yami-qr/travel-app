import { describe, expect, it } from "vitest";
import { flagEmoji, formatPopulation } from "./flags";

describe("flagEmoji", () => {
  it("turns a country code into a flag, ignoring case", () => {
    expect(flagEmoji("PT")).toBe("🇵🇹");
    expect(flagEmoji("jp")).toBe("🇯🇵");
  });

  it("returns an empty string for missing or invalid codes", () => {
    expect(flagEmoji(undefined)).toBe("");
    expect(flagEmoji("")).toBe("");
    expect(flagEmoji("PRT")).toBe("");
    expect(flagEmoji("1A")).toBe("");
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
