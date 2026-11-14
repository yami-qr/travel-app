import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ExplorePage from "./ExplorePage";
import { FavouritesProvider } from "../context/FavouritesContext";
import { ApiError } from "../services/api/http";
import type { Place } from "../services/api/places";

const searchPlaces = vi.fn<(query: string, signal?: AbortSignal) => Promise<Place[]>>();

vi.mock("../services/api/places", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/api/places")>()),
  searchPlaces: (query: string, signal?: AbortSignal) => searchPlaces(query, signal),
}));

const lisbonPT: Place = {
  id: 2267057,
  name: "Lisbon",
  country: "Portugal",
  countryCode: "PT",
  region: "Lisbon District",
  latitude: 38.7,
  longitude: -9.1,
  population: 517802,
  featureCode: "PPLC",
};

const lisbonUS: Place = {
  id: 5160951,
  name: "Lisbon",
  country: "United States",
  countryCode: "US",
  region: "Ohio",
  latitude: 40.7,
  longitude: -80.7,
  population: 2727,
  featureCode: "PPLA2",
};

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="location">{location.pathname + location.search}</p>;
}

function renderExplore(path = "/explore?q=lisbon") {
  return render(
    <FavouritesProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/explore" element={<ExplorePage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </FavouritesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  searchPlaces.mockReset();
});

afterEach(cleanup);

describe("ExplorePage", () => {
  it("shows suggestions and does not search before anything is typed", () => {
    renderExplore("/explore");
    expect(screen.getByRole("heading", { name: /Not sure yet/ })).toBeTruthy();
    expect(searchPlaces).not.toHaveBeenCalled();
  });

  it("searches for the query in the URL and lists the results", async () => {
    searchPlaces.mockResolvedValue([lisbonPT, lisbonUS]);
    renderExplore();

    expect(screen.getByRole("status").textContent).toMatch(/Searching/);
    expect(await screen.findByText("2 places found")).toBeTruthy();
    expect(searchPlaces).toHaveBeenCalledWith("lisbon", expect.any(AbortSignal));

    const links = screen.getAllByRole("link", { name: "Lisbon" });
    expect(links[0].getAttribute("href")).toBe("/destinations/2267057");
    expect(screen.getByText("Lisbon District, Portugal")).toBeTruthy();
  });

  it("searches as the person types, and keeps the query in the URL", async () => {
    searchPlaces.mockResolvedValue([lisbonPT]);
    renderExplore("/explore");

    fireEvent.change(screen.getByLabelText("Search for a city or town"), { target: { value: "Lisb" } });

    expect(await screen.findByText("1 place found")).toBeTruthy();
    expect(searchPlaces).toHaveBeenCalledWith("Lisb", expect.any(AbortSignal));
    expect(screen.getByTestId("location").textContent).toBe("/explore?q=Lisb");
  });

  it("filters results to capitals", async () => {
    searchPlaces.mockResolvedValue([lisbonPT, lisbonUS]);
    renderExplore();
    await screen.findByText("2 places found");

    fireEvent.click(screen.getByRole("button", { name: "Capitals" }));

    expect(screen.getByRole("button", { name: "Capitals" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Showing 1 of 2 places")).toBeTruthy();
    expect(screen.queryByText("Ohio, United States")).toBeNull();
  });

  it("filters results by country", async () => {
    searchPlaces.mockResolvedValue([lisbonPT, lisbonUS]);
    renderExplore();
    await screen.findByText("2 places found");

    fireEvent.change(screen.getByLabelText("Country"), { target: { value: "United States" } });

    expect(screen.getByText("Ohio, United States")).toBeTruthy();
    expect(screen.queryByText("Lisbon District, Portugal")).toBeNull();
  });

  it("sorts results by name", async () => {
    const abrantes = { ...lisbonPT, id: 1, name: "Abrantes", region: "Santarém", population: 1 };
    searchPlaces.mockResolvedValue([lisbonPT, abrantes]);
    renderExplore();
    await screen.findByText("2 places found");

    fireEvent.change(screen.getByLabelText("Sort by"), { target: { value: "name" } });

    const headings = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(["Abrantes", "Lisbon"]);
  });

  it("explains when nothing matches", async () => {
    searchPlaces.mockResolvedValue([]);
    renderExplore("/explore?q=zzzz");
    expect(await screen.findByText(/No places match “zzzz”/)).toBeTruthy();
  });

  it("shows the error and searches again on Try again", async () => {
    searchPlaces
      .mockRejectedValueOnce(new ApiError("You appear to be offline, or the service could not be reached."))
      .mockResolvedValueOnce([lisbonPT]);
    renderExplore();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/offline/);

    fireEvent.click(within(alert).getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("1 place found")).toBeTruthy();
    expect(searchPlaces).toHaveBeenCalledTimes(2);
  });

  it("lets a result be saved to favourites", async () => {
    searchPlaces.mockResolvedValue([lisbonPT]);
    renderExplore();
    await screen.findByText("1 place found");

    fireEvent.click(screen.getByRole("button", { name: "Save Lisbon to favourites" }));

    await waitFor(() =>
      expect(window.localStorage.getItem("travel-planner.favourites")).toContain("Lisbon"),
    );
  });
});
