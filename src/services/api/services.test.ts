import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearApiCache } from "./http";
import { getPlace, placeLabel, searchPlaces } from "./places";
import { describeWeather, getForecast } from "./weather";
import {
  classifyAttraction,
  distanceKm,
  getAttractions,
  getDestinationSummary,
} from "./wikipedia";

const fetchMock = vi.fn<typeof fetch>();

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

/** The URL of the nth fetch call, parsed. */
function calledUrl(n = 0): URL {
  return new URL(String(fetchMock.mock.calls[n][0]));
}

beforeEach(() => {
  clearApiCache();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("places", () => {
  const lisbon = {
    id: 2267057,
    name: "Lisbon",
    latitude: 38.72509,
    longitude: -9.1498,
    feature_code: "PPLC",
    country_code: "PT",
    timezone: "Europe/Lisbon",
    population: 517802,
    country: "Portugal",
    admin1: "Lisbon District",
  };

  it("maps search results to places", async () => {
    fetchMock.mockResolvedValueOnce(respond({ results: [lisbon] }));

    const places = await searchPlaces("Lisbon");

    expect(places).toEqual([
      {
        id: 2267057,
        name: "Lisbon",
        country: "Portugal",
        countryCode: "PT",
        region: "Lisbon District",
        latitude: 38.72509,
        longitude: -9.1498,
        population: 517802,
        timezone: "Europe/Lisbon",
        featureCode: "PPLC",
      },
    ]);
    expect(calledUrl().searchParams.get("name")).toBe("Lisbon");
  });

  it("returns no results when nothing matches", async () => {
    fetchMock.mockResolvedValueOnce(respond({ generationtime_ms: 0.1 }));
    await expect(searchPlaces("zzzz")).resolves.toEqual([]);
  });

  it("does not call the API for a query shorter than 2 characters", async () => {
    await expect(searchPlaces(" a ")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("looks up a place by id", async () => {
    fetchMock.mockResolvedValueOnce(respond(lisbon));

    const place = await getPlace(2267057);

    expect(place.name).toBe("Lisbon");
    expect(calledUrl().searchParams.get("id")).toBe("2267057");
  });

  it("reports an unknown id as not found", async () => {
    fetchMock.mockResolvedValueOnce(respond({ reason: "Location ID not found.", error: true }, 400));

    const error = await getPlace(999999999).catch((e: unknown) => e);

    expect(error).toMatchObject({ status: 404, message: "We couldn't find that." });
  });

  it("labels a place with its country", () => {
    expect(placeLabel({ name: "Lisbon", country: "Portugal" })).toBe("Lisbon, Portugal");
    expect(placeLabel({ name: "Atlantis", country: "" })).toBe("Atlantis");
  });
});

describe("weather", () => {
  it("maps the daily forecast and rounds temperatures", async () => {
    fetchMock.mockResolvedValueOnce(
      respond({
        daily: {
          time: ["2026-11-14", "2026-11-15"],
          temperature_2m_max: [19.6, 20.2],
          temperature_2m_min: [15.2, 15.5],
          precipitation_probability_max: [58, null],
          weather_code: [61, 0],
        },
      }),
    );

    const days = await getForecast(38.72, -9.13);

    expect(days).toEqual([
      { date: "2026-11-14", maxC: 20, minC: 15, rainChance: 58, code: 61 },
      { date: "2026-11-15", maxC: 20, minC: 16, rainChance: 0, code: 0 },
    ]);
  });

  it("describes weather codes in plain words", () => {
    expect(describeWeather(0).label).toBe("Clear");
    expect(describeWeather(2).label).toBe("Partly cloudy");
    expect(describeWeather(63).label).toBe("Rain");
    expect(describeWeather(81).label).toBe("Rain");
    expect(describeWeather(73).label).toBe("Snow");
    expect(describeWeather(95).label).toBe("Thunderstorm");
  });
});

describe("destination summary", () => {
  it("returns the article summary for the place", async () => {
    fetchMock.mockResolvedValueOnce(
      respond({
        type: "standard",
        title: "Lisbon",
        description: "Capital of Portugal",
        extract: "Lisbon is the capital.",
        thumbnail: { source: "https://img/small.jpg" },
        originalimage: { source: "https://img/large.jpg" },
        content_urls: { desktop: { page: "https://en.wikipedia.org/wiki/Lisbon" } },
      }),
    );

    const summary = await getDestinationSummary({ name: "Lisbon", country: "Portugal" });

    expect(summary).toEqual({
      title: "Lisbon",
      description: "Capital of Portugal",
      extract: "Lisbon is the capital.",
      imageUrl: "https://img/large.jpg",
      pageUrl: "https://en.wikipedia.org/wiki/Lisbon",
    });
  });

  it("skips a disambiguation page and tries a more specific title", async () => {
    fetchMock
      .mockResolvedValueOnce(respond({ type: "disambiguation", title: "Springfield", extract: "May refer to" }))
      .mockResolvedValueOnce(
        respond({ type: "standard", title: "Springfield, Illinois", extract: "Capital of Illinois." }),
      );

    const summary = await getDestinationSummary({
      name: "Springfield",
      region: "Illinois",
      country: "United States",
    });

    expect(summary?.title).toBe("Springfield, Illinois");
    expect(decodeURIComponent(String(fetchMock.mock.calls[1][0]))).toContain("Springfield, Illinois");
  });

  it("returns null when no article exists", async () => {
    fetchMock.mockImplementation(async () => respond({}, 404));
    await expect(getDestinationSummary({ name: "Nowhere", country: "Atlantis" })).resolves.toBeNull();
  });
});

describe("attractions", () => {
  it("classifies articles by their description", () => {
    expect(classifyAttraction("São Jorge Castle", "Historic castle in Lisbon, Portugal")).toBe("history");
    expect(classifyAttraction("Igreja da Madalena", "Church in Lisbon, Lisbon District, Portugal")).toBe(
      "religious",
    );
    expect(classifyAttraction("Rossio", "Town square in Lisbon, Portugal")).toBe("landmark");
    expect(classifyAttraction("Alfama", "Neighborhood in Lisbon")).toBe("neighbourhood");
    expect(classifyAttraction("D. Maria II National Theatre", "Dramatic theatre in Lisbon")).toBe("culture");
    expect(classifyAttraction("Gulbenkian Museum", "Art museum in Lisbon")).toBe("museum");
  });

  it("falls back to the title when there is no description", () => {
    expect(classifyAttraction("Estaus Palace")).toBe("history");
    expect(classifyAttraction("Teatro Aberto")).toBe("culture");
  });

  it("skips anything that matches no sight category", () => {
    expect(classifyAttraction("Lisbon", "Capital and largest city of Portugal")).toBeNull();
    expect(classifyAttraction("Euronext Lisbon", "Stock exchange in Lisbon, Portugal")).toBeNull();
    expect(classifyAttraction("Somewhere Else")).toBeNull();
  });

  it("skips organisations even when their names contain sight words", () => {
    expect(classifyAttraction("Institute for Nature Conservation and Forests")).toBeNull();
    expect(classifyAttraction("Constitutional Court (Portugal)", "Supreme Court in Portugal")).toBeNull();
  });

  it("skips places that no longer exist", () => {
    expect(classifyAttraction("Teatro Avenida", "Defunct theatre in Lisbon, Portugal")).toBeNull();
    expect(classifyAttraction("Bristol Club", "Nightclub in Lisbon, Portugal (1918–1928)")).toBeNull();
  });

  it("recognises funiculars, statues and greenhouses", () => {
    expect(classifyAttraction("Ascensor da Glória", "Funicular railway in Lisbon, Portugal")).toBe("landmark");
    expect(classifyAttraction("Statue of António Vieira", "Public sculpture in Lisbon")).toBe("history");
    expect(classifyAttraction("Estufa Fria", "Greenhouse in Lisbon, Portugal")).toBe("nature");
  });

  it("skips places that are not sights", () => {
    expect(classifyAttraction("Santa Justa, Lisbon", "Civil parish in Lisbon, Portugal")).toBeNull();
    expect(classifyAttraction("Rossio Station", "Metro station in Lisbon, Portugal")).toBeNull();
    expect(classifyAttraction("São José Hospital", "Hospital in Lisbon, Portugal")).toBeNull();
    expect(classifyAttraction("Siege of Lisbon", "1147 Second Crusade battle")).toBeNull();
    expect(classifyAttraction("Timeline of Lisbon", "")).toBeNull();
  });

  it("does not treat 'Lisbon District' in a church description as a district", () => {
    expect(classifyAttraction("Igreja de Santa Luzia", "Church in Lisbon, Lisbon District, Portugal")).toBe(
      "religious",
    );
  });

  it("measures distance in kilometres", () => {
    // Lisbon to Porto is about 274 km in a straight line.
    expect(distanceKm(38.7223, -9.1393, 41.1579, -8.6291)).toBeCloseTo(274, -1);
    expect(distanceKm(10, 10, 10, 10)).toBe(0);
  });

  it("returns sights nearest first and drops the rest", async () => {
    fetchMock.mockResolvedValueOnce(
      respond({
        query: {
          pages: [
            {
              pageid: 2,
              title: "Far Castle",
              description: "Castle",
              coordinates: [{ lat: 38.75, lon: -9.13 }],
            },
            {
              pageid: 1,
              title: "Near Church",
              description: "Church in Lisbon",
              thumbnail: { source: "https://img/church.jpg" },
              coordinates: [{ lat: 38.7168, lon: -9.1333 }],
            },
            { pageid: 3, title: "Rossio Station", description: "Metro station", coordinates: [{ lat: 38.71, lon: -9.13 }] },
            { pageid: 4, title: "No Coordinates", description: "Castle" },
          ],
        },
      }),
    );

    const attractions = await getAttractions(38.7167, -9.1333);

    expect(attractions.map((a) => a.title)).toEqual(["Near Church", "Far Castle"]);
    expect(attractions[0]).toMatchObject({
      id: 1,
      category: "religious",
      imageUrl: "https://img/church.jpg",
      pageUrl: "https://en.wikipedia.org/?curid=1",
    });
    expect(calledUrl().searchParams.get("origin")).toBe("*");
    // Without these, Wikipedia only returns coordinates for the first 10 pages.
    expect(calledUrl().searchParams.get("colimit")).toBe("max");
    expect(calledUrl().searchParams.get("pilimit")).toBe("max");
  });

  it("handles a response with no pages", async () => {
    fetchMock.mockResolvedValueOnce(respond({ batchcomplete: "" }));
    await expect(getAttractions(0, 0)).resolves.toEqual([]);
  });
});
