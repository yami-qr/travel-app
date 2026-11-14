import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import DestinationsSection from "./DestinationsSection";
import { destinations } from "../data/destinations";

afterEach(cleanup);

describe("DestinationsSection", () => {
  it("offers a country button and a place card for every destination", () => {
    render(<DestinationsSection onPlanTrip={() => {}} />);
    expect(screen.getAllByRole("button")).toHaveLength(destinations.length * 2);
  });

  it("starts a trip to a place with its country", () => {
    const onPlanTrip = vi.fn();
    render(<DestinationsSection onPlanTrip={onPlanTrip} />);

    fireEvent.click(screen.getByRole("button", { name: "Plan a trip to Lisbon, Portugal" }));

    expect(onPlanTrip).toHaveBeenCalledWith("Lisbon, Portugal");
  });

  it("starts a trip to a country", () => {
    const onPlanTrip = vi.fn();
    render(<DestinationsSection onPlanTrip={onPlanTrip} />);

    fireEvent.click(screen.getByRole("button", { name: "Plan a trip to Japan" }));

    expect(onPlanTrip).toHaveBeenCalledWith("Japan");
  });
});
