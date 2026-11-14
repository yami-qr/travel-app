import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DestinationPage from "./DestinationPage";
import { FavouritesProvider } from "../context/FavouritesContext";
import { sampleTrips } from "../data/sampleTrips";
import { ApiError } from "../services/api/http";
import type { Place } from "../services/api/places";
import type { DailyForecast } from "../services/api/weather";
import type { Attraction, DestinationSummary } from "../services/api/wikipedia";

const api = vi.hoisted(() => ({
  getPlace: vi.fn(),
  getForecast: vi.fn(),
  getDestinationSummary: vi.fn(),
  getAttractions: vi.fn(),
}));

vi.mock("../services/api/places", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/api/places")>()),
  getPlace: api.getPlace,
}));
vi.mock("../services/api/weather", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/api/weather")>()),
  getForecast: api.getForecast,
}));
vi.mock("../services/api/wikipedia", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/api/wikipedia")>()),
  getDestinationSummary: api.getDestinationSummary,
  getAttractions: api.getAttractions,
}));

const lisbon: Place = {
  id: 2267057,
  name: "Lisbon",
  country: "Portugal",
  countryCode: "PT",
  region: "Lisbon District",
  latitude: 38.725,
  longitude: -9.15,
  population: 517802,
  timezone: "Europe/Lisbon",
  featureCode: "PPLC",
};

const summary: DestinationSummary = {
  title: "Lisbon",
  description: "Capital and largest city of Portugal",
  extract: "Lisbon is the capital and largest city of Portugal.",
  imageUrl: "https://img/lisbon.jpg",
  pageUrl: "https://en.wikipedia.org/wiki/Lisbon",
};

const forecast: DailyForecast[] = [
  { date: "2027-03-12", maxC: 19, minC: 14, rainChance: 10, code: 0 },
  { date: "2027-03-13", maxC: 17, minC: 13, rainChance: 70, code: 63 },
];

function sight(id: number, title: string, category: Attraction["category"], distanceKm = 1): Attraction {
  return {
    id,
    title,
    category,
    description: `${title} description`,
    latitude: 38.7,
    longitude: -9.1,
    distanceKm,
    pageUrl: `https://en.wikipedia.org/?curid=${id}`,
  };
}

const sights = [
  sight(1, "São Jorge Castle", "history", 0.4),
  sight(2, "Lisbon Cathedral", "religious"),
  sight(3, "Rossio", "landmark", 2.3),
];

const onPlanTrip = vi.fn();
const onAddToTrip = vi.fn();

function renderPage(path = "/destinations/2267057", trips = sampleTrips) {
  return render(
    <FavouritesProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/destinations/:placeId"
            element={<DestinationPage trips={trips} onPlanTrip={onPlanTrip} onAddToTrip={onAddToTrip} />}
          />
        </Routes>
      </MemoryRouter>
    </FavouritesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
  api.getPlace.mockResolvedValue(lisbon);
  api.getDestinationSummary.mockResolvedValue(summary);
  api.getForecast.mockResolvedValue(forecast);
  api.getAttractions.mockResolvedValue(sights);
});

afterEach(cleanup);

describe("DestinationPage", () => {
  it("shows the place, its description, the weather and nearby sights", async () => {
    renderPage();

    expect(await screen.findByRole("heading", { level: 1, name: "Lisbon" })).toBeTruthy();
    expect(screen.getByText("Population 517,802")).toBeTruthy();
    expect(await screen.findByText(summary.extract)).toBeTruthy();
    expect(screen.getByRole("img", { name: "View of Lisbon" })).toBeTruthy();
    expect(await screen.findByText("Rain.")).toBeTruthy();
    expect(await screen.findByText("3 sights")).toBeTruthy();
    expect(api.getAttractions).toHaveBeenCalledWith(38.725, -9.15, expect.any(AbortSignal));
  });

  it("shows a not-found page for an unknown place", async () => {
    api.getPlace.mockRejectedValue(new ApiError("We couldn't find that.", 404));
    renderPage("/destinations/999");

    expect(await screen.findByRole("heading", { name: "We couldn't find that place" })).toBeTruthy();
  });

  it("shows a not-found page for an id that is not a number", () => {
    renderPage("/destinations/abc");
    expect(screen.getByRole("heading", { name: "We couldn't find that place" })).toBeTruthy();
    expect(api.getPlace).not.toHaveBeenCalled();
  });

  it("keeps the page working when one section fails, and retries just that section", async () => {
    api.getForecast.mockRejectedValueOnce(new ApiError("The service is having problems.")).mockResolvedValueOnce(forecast);
    renderPage();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/Couldn't load the forecast/);
    expect(await screen.findByText("3 sights")).toBeTruthy();

    fireEvent.click(within(alert).getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Rain.")).toBeTruthy();
  });

  it("filters sights by category and by name", async () => {
    renderPage();
    await screen.findByText("3 sights");

    fireEvent.click(screen.getByRole("button", { name: /History/ }));
    expect(screen.getByText("1 of 3 sights")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "São Jorge Castle" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Rossio" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /^All/ }));
    fireEvent.change(screen.getByLabelText("Filter sights by name"), { target: { value: "cathedral" } });
    expect(screen.getByText("1 of 3 sights")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Lisbon Cathedral" })).toBeTruthy();
  });

  it("adds a sight to a chosen trip and day", async () => {
    renderPage();
    await screen.findByText("3 sights");

    fireEvent.click(screen.getByRole("button", { name: "Add São Jorge Castle to a trip" }));
    const form = screen.getByRole("form", { name: "Add São Jorge Castle to a trip" });
    // The Lisbon sample trip is picked first because it goes to the same place.
    expect((within(form).getByLabelText("Trip") as HTMLSelectElement).value).toBe("trip-1");

    fireEvent.change(within(form).getByLabelText("Day"), { target: { value: "2027-03-13" } });
    fireEvent.click(within(form).getByRole("button", { name: "Add" }));

    expect(onAddToTrip).toHaveBeenCalledWith("trip-1", "2027-03-13", "São Jorge Castle");
    expect(screen.getByText(/Added to Lisbon weekend, Saturday,? 13 Mar/)).toBeTruthy();
  });

  it("offers to start a trip when there are none", async () => {
    renderPage("/destinations/2267057", []);
    await screen.findByText("3 sights");

    fireEvent.click(screen.getAllByRole("button", { name: "Start a trip to add this" })[0]);
    expect(onPlanTrip).toHaveBeenCalledWith("Lisbon, Portugal");
  });

  it("plans a trip and saves the place from the header", async () => {
    renderPage();
    await screen.findByRole("heading", { level: 1, name: "Lisbon" });

    fireEvent.click(screen.getByRole("button", { name: "Plan a trip here" }));
    expect(onPlanTrip).toHaveBeenCalledWith("Lisbon, Portugal");

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Saved" })).toBeTruthy());
  });

  it("explains when there is no Wikipedia article", async () => {
    api.getDestinationSummary.mockResolvedValue(null);
    renderPage();
    expect(await screen.findByText("There's no Wikipedia article for Lisbon yet.")).toBeTruthy();
  });
});
