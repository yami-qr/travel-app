import { buildUrl, fetchJson } from "./http";
import type { Place } from "./places";

/* ---------- Destination summary ---------- */

export interface DestinationSummary {
  title: string;
  /** Short line such as "Capital and largest city of Portugal". */
  description?: string;
  /** First paragraph of the article, as plain text. */
  extract: string;
  imageUrl?: string;
  pageUrl: string;
}

interface SummaryResponse {
  type: string;
  title: string;
  description?: string;
  extract?: string;
  thumbnail?: { source: string };
  originalimage?: { source: string };
  content_urls?: { desktop?: { page?: string } };
}

const SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/";

async function fetchSummary(title: string, signal?: AbortSignal): Promise<SummaryResponse | null> {
  try {
    return await fetchJson<SummaryResponse>(SUMMARY_URL + encodeURIComponent(title), {
      signal,
      ttl: 60 * 60 * 1000,
    });
  } catch (error) {
    // A missing article is expected for small places; let the caller try the next title.
    if (error instanceof Error && "status" in error && error.status === 404) return null;
    throw error;
  }
}

/**
 * Finds the Wikipedia article for a place. Many place names are shared
 * ("Springfield"), so it tries the most specific title first and skips
 * disambiguation pages. Returns null when there is no article.
 */
export async function getDestinationSummary(
  place: Pick<Place, "name" | "region" | "country">,
  signal?: AbortSignal,
): Promise<DestinationSummary | null> {
  const candidates = [
    place.name,
    place.region ? `${place.name}, ${place.region}` : null,
    place.country ? `${place.name}, ${place.country}` : null,
  ].filter((title): title is string => Boolean(title));

  for (const title of candidates) {
    const summary = await fetchSummary(title, signal);
    if (summary && summary.type !== "disambiguation" && summary.extract) {
      return {
        title: summary.title,
        description: summary.description,
        extract: summary.extract,
        imageUrl: summary.originalimage?.source ?? summary.thumbnail?.source,
        pageUrl:
          summary.content_urls?.desktop?.page ??
          `https://en.wikipedia.org/wiki/${encodeURIComponent(summary.title)}`,
      };
    }
  }
  return null;
}

/* ---------- Attractions ---------- */

export type AttractionCategory =
  | "history"
  | "religious"
  | "museum"
  | "nature"
  | "culture"
  | "landmark"
  | "neighbourhood"
  | "other";

export const attractionCategoryLabels: Record<AttractionCategory, string> = {
  history: "History",
  religious: "Religious sites",
  museum: "Museums",
  nature: "Parks & nature",
  culture: "Arts & nightlife",
  landmark: "Squares & streets",
  neighbourhood: "Neighbourhoods",
  other: "Other",
};

export interface Attraction {
  id: number;
  title: string;
  description?: string;
  category: AttractionCategory;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  /** Distance from the destination centre, in kilometres. */
  distanceKm: number;
  pageUrl: string;
}

/** Results that are not places to visit: admin areas, transport, events, organisations. */
const NOT_A_SIGHT =
  /^(former )?(civil parish|parish|municipality|district|metro station|railway station|train station|station|hospital|school|university|company|bank|embassy|hotel|roman catholic (arch)?diocese|(arch)?diocese)|battle|siege|earthquake|massacre|election|timeline of/i;

const CATEGORY_RULES: [AttractionCategory, RegExp][] = [
  ["museum", /museum|gallery/i],
  ["religious", /church|cathedral|basilica|monastery|convent|temple|mosque|synagogue|shrine|chapel|abbey|igreja|catholic building/i],
  ["history", /castle|palace|fort\b|fortress|tower|monument|historic|ruin|memorial|column|prison|pantheon|archaeological|aqueduct|city wall|gate\b/i],
  ["nature", /park|garden|beach|mountain|lake|river|island|forest|viewpoint|miradouro|botanical|zoo|aquarium|waterfall|nature reserve/i],
  ["culture", /theatre|theater|opera|concert|cinema|stadium|arena|nightclub|music venue|cultural centre/i],
  ["landmark", /square|plaza|praça|street|avenue|boulevard|market|bridge|promenade|fountain/i],
  ["neighbourhood", /neighbou?rhood|quarter\b|old town/i],
];

/** Puts an article into a category from its short description, falling back to its title. Null means skip it. */
export function classifyAttraction(title: string, description = ""): AttractionCategory | null {
  if (NOT_A_SIGHT.test(description) || /^timeline of|^siege of|^battle of/i.test(title)) {
    return null;
  }
  for (const [category, pattern] of CATEGORY_RULES) {
    if (pattern.test(description)) return category;
  }
  for (const [category, pattern] of CATEGORY_RULES) {
    if (pattern.test(title)) return category;
  }
  return "other";
}

/** Great-circle distance between two points, in kilometres. */
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface GeoSearchPage {
  pageid: number;
  title: string;
  description?: string;
  thumbnail?: { source: string };
  coordinates?: { lat: number; lon: number }[];
}

interface GeoSearchResponse {
  query?: { pages?: GeoSearchPage[] };
}

const ACTION_API_URL = "https://en.wikipedia.org/w/api.php";

/** Notable places with a Wikipedia article within `radiusMetres` of a point, nearest first. */
export async function getAttractions(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
  radiusMetres = 10_000,
): Promise<Attraction[]> {
  const url = buildUrl(ACTION_API_URL, {
    action: "query",
    generator: "geosearch",
    ggscoord: `${latitude}|${longitude}`,
    ggsradius: radiusMetres,
    ggslimit: 50,
    prop: "pageimages|description|coordinates",
    piprop: "thumbnail",
    pithumbsize: 400,
    format: "json",
    formatversion: 2,
    // Allows the request from a browser on any site.
    origin: "*",
  });

  const data = await fetchJson<GeoSearchResponse>(url, { signal, ttl: 60 * 60 * 1000 });
  const attractions: Attraction[] = [];

  for (const page of data.query?.pages ?? []) {
    const point = page.coordinates?.[0];
    const category = classifyAttraction(page.title, page.description);
    if (!point || !category) continue;

    attractions.push({
      id: page.pageid,
      title: page.title,
      description: page.description,
      category,
      imageUrl: page.thumbnail?.source,
      latitude: point.lat,
      longitude: point.lon,
      distanceKm: distanceKm(latitude, longitude, point.lat, point.lon),
      pageUrl: `https://en.wikipedia.org/?curid=${page.pageid}`,
    });
  }

  return attractions.sort((a, b) => a.distanceKm - b.distanceKm);
}
