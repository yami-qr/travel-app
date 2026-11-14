import { describe, expect, it } from "vitest";
import { destinationCode } from "./codes";

describe("destinationCode", () => {
  it("uses the first three letters of the city", () => {
    expect(destinationCode("Lisbon, Portugal")).toBe("LIS");
  });

  it("drops accents, spaces and punctuation", () => {
    expect(destinationCode("São Paulo")).toBe("SAO");
    expect(destinationCode("Ha Long, Vietnam")).toBe("HAL");
    expect(destinationCode("St. Ives")).toBe("STI");
  });

  it("falls back to ??? when there are no letters", () => {
    expect(destinationCode("")).toBe("???");
    expect(destinationCode("123")).toBe("???");
  });
});
