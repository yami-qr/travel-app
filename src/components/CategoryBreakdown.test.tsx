import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import CategoryBreakdown from "./CategoryBreakdown";

afterEach(cleanup);

describe("CategoryBreakdown", () => {
  it("shows the amount for every category, including zero", () => {
    render(<CategoryBreakdown totals={{ food: 20, transport: 30, stay: 0, activity: 10 }} />);
    const list = screen.getByRole("list");
    const rows = within(list).getAllByRole("listitem");

    // Rows follow the order: Activities, Food, Transport, Stay.
    expect(rows).toHaveLength(4);
    expect(within(rows[0]).getByText("Activities")).toBeTruthy();
    expect(within(rows[0]).getByText("10")).toBeTruthy();
    expect(within(rows[3]).getByText("Stay")).toBeTruthy();
    expect(within(rows[3]).getByText("0")).toBeTruthy();
  });

  it("scales the largest category to the full bar width", () => {
    render(<CategoryBreakdown totals={{ food: 20, transport: 40, stay: 0, activity: 10 }} />);
    const fills = Array.from(document.querySelectorAll<HTMLElement>(".breakdown-fill"));

    // Order: Activities (10), Food (20), Transport (40), Stay (0).
    expect(fills[2].style.width).toBe("100%");
    expect(fills[1].style.width).toBe("50%");
  });

  it("gives zero-width bars when nothing has been spent", () => {
    render(<CategoryBreakdown totals={{ food: 0, transport: 0, stay: 0, activity: 0 }} />);
    const fills = Array.from(document.querySelectorAll<HTMLElement>(".breakdown-fill"));

    expect(fills.every((fill) => fill.style.width === "0%")).toBe(true);
  });
});
