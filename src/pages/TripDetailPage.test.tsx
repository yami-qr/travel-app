import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TripDetailPage from "./TripDetailPage";
import type { Trip } from "../types/trip";

afterEach(cleanup);

const baseTrip: Trip = {
  id: "t1",
  name: "Lisbon weekend",
  destination: "Lisbon, Portugal",
  startDate: "2027-03-12",
  endDate: "2027-03-13",
  budget: 100,
  days: [
    { date: "2027-03-12", activities: [] },
    { date: "2027-03-13", activities: [] },
  ],
  packing: [{ id: "p1", label: "Passport", packed: false }],
};

/** Holds trip state like the real app does, so updates show up on screen. */
function Harness({ initial }: { initial: Trip }) {
  const [trip, setTrip] = useState(initial);
  return <TripDetailPage trip={trip} onUpdate={setTrip} />;
}

function renderPage(trip: Trip = baseTrip) {
  return render(
    <MemoryRouter>
      <Harness initial={trip} />
    </MemoryRouter>,
  );
}

function addActivity(dayLabel: RegExp, title: string, cost: string) {
  const section = screen.getByRole("region", { name: dayLabel });
  const form = within(section).getByRole("button", { name: "Add activity" }).closest("form")!;
  fireEvent.change(within(form).getByLabelText("Activity"), { target: { value: title } });
  fireEvent.change(within(form).getByLabelText("Cost"), { target: { value: cost } });
  fireEvent.click(within(form).getByRole("button", { name: "Add activity" }));
}

describe("TripDetailPage", () => {
  it("shows the trip name, destination and budget", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1, name: "Lisbon weekend" })).toBeTruthy();
    expect(screen.getByText(/Lisbon, Portugal/)).toBeTruthy();
    expect(screen.getByText("0 of 100 spent")).toBeTruthy();
  });

  it("adds an activity to the right day and updates the budget", () => {
    renderPage();
    addActivity(/12 Mar/i, "Tram ride", "30");

    expect(screen.getByText("Tram ride")).toBeTruthy();
    expect(screen.getByText("30 of 100 spent")).toBeTruthy();
  });

  it("shows a validation error and adds nothing when the activity title is blank", () => {
    renderPage();
    const section = screen.getAllByRole("region")[0];
    const form = within(section).getByRole("button", { name: "Add activity" }).closest("form")!;
    fireEvent.change(within(form).getByLabelText("Cost"), { target: { value: "5" } });
    fireEvent.click(within(form).getByRole("button", { name: "Add activity" }));

    expect(screen.getByText("Give the activity a title.")).toBeTruthy();
    expect(within(section).getByText("No activities yet.")).toBeTruthy();
  });

  it("removes an activity", () => {
    renderPage();
    addActivity(/12 Mar/i, "Tram ride", "30");
    fireEvent.click(screen.getByRole("button", { name: "Remove Tram ride" }));

    expect(screen.queryByText("Tram ride")).toBeNull();
  });

  it("moves an activity down and disables the move buttons at the edges", () => {
    renderPage();
    addActivity(/12 Mar/i, "First", "1");
    addActivity(/12 Mar/i, "Second", "2");

    expect(screen.getByRole("button", { name: "Move First up" }).hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Move First down" }));
    const items = screen.getAllByRole("listitem").map((li) => li.textContent ?? "");
    expect(items[0]).toContain("Second");
    expect(items[1]).toContain("First");
  });

  it("toggles a packing item and updates the count", () => {
    renderPage();
    expect(screen.getByText("0 of 1 packed")).toBeTruthy();

    fireEvent.click(screen.getByRole("checkbox", { name: "Passport" }));
    expect(screen.getByText("1 of 1 packed")).toBeTruthy();
  });

  it("adds a packing item from the input", () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("New packing item"), {
      target: { value: "Charger" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByRole("checkbox", { name: "Charger" })).toBeTruthy();
    expect(screen.getByText("0 of 2 packed")).toBeTruthy();
  });
});
