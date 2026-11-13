import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import BudgetBar from "./BudgetBar";

afterEach(cleanup);

describe("BudgetBar", () => {
  it("shows spent against budget", () => {
    render(<BudgetBar spent={300} budget={600} />);
    expect(screen.getByText("300 of 600 spent")).toBeTruthy();
  });

  it("sets the progress value to the amount spent", () => {
    render(<BudgetBar spent={300} budget={600} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("300");
    expect(bar.getAttribute("aria-valuemax")).toBe("600");
  });

  it("does not show a warning when under budget", () => {
    render(<BudgetBar spent={300} budget={600} />);
    expect(screen.queryByText(/Over budget/)).toBeNull();
  });

  it("does not show a warning when exactly on budget", () => {
    render(<BudgetBar spent={600} budget={600} />);
    expect(screen.queryByText(/Over budget/)).toBeNull();
  });

  it("shows how far over budget the trip is", () => {
    render(<BudgetBar spent={650} budget={600} />);
    expect(screen.getByText("Over budget by 50")).toBeTruthy();
  });

  it("caps the progress value at the budget when over", () => {
    render(<BudgetBar spent={650} budget={600} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("600");
  });
});
