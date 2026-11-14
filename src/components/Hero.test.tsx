import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Hero from "./Hero";
import { sampleTrips } from "../data/sampleTrips";

afterEach(cleanup);

describe("Hero", () => {
  it("starts a trip with the destination that was typed, trimmed", () => {
    const onPlanTrip = vi.fn();
    render(<Hero onPlanTrip={onPlanTrip} />);

    fireEvent.change(screen.getByLabelText("Where to?"), { target: { value: "  Rome, Italy " } });
    fireEvent.click(screen.getByRole("button", { name: "Plan a trip" }));

    expect(onPlanTrip).toHaveBeenCalledWith("Rome, Italy");
  });

  it("starts a trip with no destination when the field is empty", () => {
    const onPlanTrip = vi.fn();
    render(<Hero onPlanTrip={onPlanTrip} />);

    fireEvent.click(screen.getByRole("button", { name: "Plan a trip" }));

    expect(onPlanTrip).toHaveBeenCalledWith("");
  });

  it("starts a trip from a suggested destination", () => {
    const onPlanTrip = vi.fn();
    render(<Hero onPlanTrip={onPlanTrip} />);

    fireEvent.click(screen.getByRole("button", { name: "Kyoto" }));

    expect(onPlanTrip).toHaveBeenCalledWith("Kyoto, Japan");
  });

  it("previews the featured trip in the phone", () => {
    render(<Hero featuredTrip={sampleTrips[1]} onPlanTrip={() => {}} />);
    expect(screen.getByText("Kyoto spring")).toBeTruthy();
  });

  it("previews a sample trip when there is no featured trip", () => {
    render(<Hero onPlanTrip={() => {}} />);
    expect(screen.getByText("Lisbon weekend")).toBeTruthy();
  });

  it("hides the phone preview from screen readers", () => {
    render(<Hero onPlanTrip={() => {}} />);
    expect(screen.getByText("Lisbon weekend").closest("[aria-hidden='true']")).toBeTruthy();
  });
});
