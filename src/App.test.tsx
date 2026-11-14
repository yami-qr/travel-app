import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { TRIPS_STORAGE_KEY } from "./services/storage";

function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

/** The "My trips" section of the home page. Other sections may repeat trip names. */
function tripsSection() {
  return within(screen.getByRole("region", { name: /boarding passes/ }));
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

function fillTripForm(name: string) {
  fireEvent.change(screen.getByLabelText("Trip name"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Destination"), { target: { value: "Rome, Italy" } });
  fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2027-05-01" } });
  fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2027-05-03" } });
  fireEvent.change(screen.getByLabelText("Budget"), { target: { value: "900" } });
  fireEvent.click(screen.getByRole("button", { name: "Create trip" }));
}

function createTripThroughForm(name: string) {
  fireEvent.click(screen.getByRole("button", { name: "New trip" }));
  fillTripForm(name);
}

describe("App", () => {
  it("lists the sample trips on load", () => {
    renderApp();
    expect(tripsSection().getByText("Lisbon weekend")).toBeTruthy();
    expect(tripsSection().getByText("Kyoto spring")).toBeTruthy();
  });

  it("opens the new trip form in a dialog from the header button", () => {
    renderApp();
    fireEvent.click(screen.getByRole("button", { name: "New trip" }));
    expect(screen.getByRole("dialog", { name: "Plan a new trip" })).toBeTruthy();
  });

  it("opens the new trip's page and closes the form after creating it", () => {
    renderApp();
    createTripThroughForm("Rome break");

    expect(screen.getByRole("heading", { level: 1, name: "Rome break" })).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("puts a created trip at the top of the trip list", () => {
    renderApp();
    createTripThroughForm("Rome break");
    fireEvent.click(screen.getByRole("link", { name: "← All trips" }));

    const items = tripsSection().getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toContain("Rome break");
  });

  it("closes the form without adding a trip when Cancel is clicked", () => {
    renderApp();
    fireEvent.click(screen.getByRole("button", { name: "New trip" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(tripsSection().getAllByRole("listitem")).toHaveLength(2);
  });

  it("closes the form when Escape is pressed", () => {
    renderApp();
    fireEvent.click(screen.getByRole("button", { name: "New trip" }));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("can create a trip while viewing another trip", () => {
    renderApp("/trips/trip-1");
    createTripThroughForm("Rome break");

    expect(screen.getByRole("heading", { level: 1, name: "Rome break" })).toBeTruthy();
  });

  it("keeps a created trip after the app is remounted", () => {
    const first = renderApp();
    createTripThroughForm("Rome break");
    first.unmount();

    renderApp();
    expect(tripsSection().getByText("Rome break")).toBeTruthy();
  });

  it("shows only the saved trips on later visits, not the sample trips", () => {
    window.localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify([]));
    renderApp();

    // The hero's phone preview may still show a sample; the trip list must not.
    expect(tripsSection().queryByText("Lisbon weekend")).toBeNull();
    expect(tripsSection().getByText("No trips yet. Create one to get started.")).toBeTruthy();
  });

  it("opens a trip's detail page from its card", () => {
    renderApp();
    fireEvent.click(tripsSection().getByRole("link", { name: "Lisbon weekend" }));

    expect(screen.getByRole("heading", { level: 1, name: "Lisbon weekend" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "← All trips" })).toBeTruthy();
  });

  it("shows a not-found page for an unknown trip id", () => {
    renderApp("/trips/does-not-exist");
    expect(screen.getByRole("heading", { name: "Trip not found" })).toBeTruthy();
  });
});
