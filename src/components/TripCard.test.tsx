import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TripCard from "./TripCard";
import type { Trip } from "../types/trip";

afterEach(cleanup);

function makeTrip(activityCount: number): Trip {
  return {
    id: "t1",
    name: "Kyoto spring",
    destination: "Kyoto, Japan",
    startDate: "2027-04-02",
    endDate: "2027-04-09",
    budget: 1800,
    days: [
      {
        date: "2027-04-02",
        activities: Array.from({ length: activityCount }, (_, i) => ({
          id: `a${i}`,
          title: `Activity ${i}`,
          cost: 10,
          category: "activity" as const,
        })),
      },
    ],
    packing: [],
  };
}

function renderCard(trip: Trip) {
  // TripCard renders an <li> and a router link, so wrap it in a <ul> and a router.
  return render(
    <MemoryRouter>
      <ul>
        <TripCard trip={trip} />
      </ul>
    </MemoryRouter>,
  );
}

describe("TripCard", () => {
  it("shows the trip name and destination", () => {
    renderCard(makeTrip(0));
    expect(screen.getByRole("heading", { name: "Kyoto spring" })).toBeTruthy();
    expect(screen.getByText("Kyoto, Japan")).toBeTruthy();
  });

  it("shows the activity count in the plural", () => {
    renderCard(makeTrip(3));
    expect(screen.getByText("3 activities")).toBeTruthy();
  });

  it("uses the singular for exactly one activity", () => {
    renderCard(makeTrip(1));
    expect(screen.getByText("1 activity")).toBeTruthy();
  });

  it("shows zero activities for an empty trip", () => {
    renderCard(makeTrip(0));
    expect(screen.getByText("0 activities")).toBeTruthy();
  });

  it("shows the budget spent for the trip", () => {
    // Fixture: 3 activities at 10 each against a budget of 1800.
    renderCard(makeTrip(3));
    expect(screen.getByText("30 of 1800 spent")).toBeTruthy();
  });

  it("warns when the trip is over budget", () => {
    renderCard({ ...makeTrip(3), budget: 20 });
    expect(screen.getByText("Over budget by 10")).toBeTruthy();
  });
});
