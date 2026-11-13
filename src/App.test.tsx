import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

function createTripThroughForm(name: string) {
  fireEvent.click(screen.getByRole("button", { name: "New trip" }));
  fireEvent.change(screen.getByLabelText("Trip name"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Destination"), { target: { value: "Rome, Italy" } });
  fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2027-05-01" } });
  fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2027-05-03" } });
  fireEvent.change(screen.getByLabelText("Budget"), { target: { value: "900" } });
  fireEvent.click(screen.getByRole("button", { name: "Create trip" }));
}

describe("App", () => {
  it("lists the sample trips on load", () => {
    renderApp();
    expect(screen.getByText("Lisbon weekend")).toBeTruthy();
    expect(screen.getByText("Kyoto spring")).toBeTruthy();
  });

  it("opens the new trip form from the header button", () => {
    renderApp();
    fireEvent.click(screen.getByRole("button", { name: "New trip" }));
    expect(screen.getByRole("heading", { name: "Plan a new trip" })).toBeTruthy();
  });

  it("adds a created trip to the top of the list and closes the form", () => {
    renderApp();
    createTripThroughForm("Rome break");

    expect(screen.getByText("Rome break")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Plan a new trip" })).toBeNull();

    const items = screen.getAllByRole("listitem");
    expect(items[0].textContent).toContain("Rome break");
  });

  it("closes the form without adding a trip when Cancel is clicked", () => {
    renderApp();
    fireEvent.click(screen.getByRole("button", { name: "New trip" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("heading", { name: "Plan a new trip" })).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("keeps a created trip after the app is remounted", () => {
    const first = renderApp();
    createTripThroughForm("Rome break");
    first.unmount();

    renderApp();
    expect(screen.getByText("Rome break")).toBeTruthy();
  });

  it("shows only the saved trips on later visits, not the sample trips", () => {
    window.localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify([]));
    renderApp();

    expect(screen.queryByText("Lisbon weekend")).toBeNull();
    expect(screen.getByText("No trips yet. Create one to get started.")).toBeTruthy();
  });

  it("opens a trip's detail page from its card", () => {
    renderApp();
    fireEvent.click(screen.getByRole("link", { name: "Lisbon weekend" }));

    expect(screen.getByRole("heading", { level: 1, name: "Lisbon weekend" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "← All trips" })).toBeTruthy();
  });

  it("shows a not-found message for an unknown trip id", () => {
    renderApp("/trips/does-not-exist");
    expect(screen.getByText(/Trip not found/)).toBeTruthy();
  });
});
