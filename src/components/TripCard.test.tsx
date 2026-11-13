import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
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
  // TripCard renders an <li>, so wrap it in a <ul> to keep the markup valid.
  return render(
    <ul>
      <TripCard trip={trip} />
    </ul>,
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
});
