import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import PlaceCard from "../components/PlaceCard";
import { destinations } from "../data/destinations";
import { useApi, useDebouncedValue } from "../hooks/useApi";
import { searchPlaces } from "../services/api/places";
import {
  countriesIn,
  defaultFilters,
  filterAndSortPlaces,
  type PlaceFilters,
  type PlaceKind,
  type PlaceSort,
} from "../utils/explore";

const kinds: { value: PlaceKind; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "cities", label: "Cities & towns" },
  { value: "capitals", label: "Capitals" },
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [filters, setFilters] = useState<PlaceFilters>(defaultFilters);

  // Wait until typing pauses before searching, so each keystroke is not a request.
  const debouncedQuery = useDebouncedValue(query.trim(), 350);
  const canSearch = debouncedQuery.length >= 2;

  // Keep the search in the URL, so results can be shared and survive a refresh.
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (current !== debouncedQuery) {
      setSearchParams(debouncedQuery ? { q: debouncedQuery } : {}, { replace: true });
    }
  }, [debouncedQuery, searchParams, setSearchParams]);

  // A new search starts with fresh filters, since the old country may not appear in it.
  useEffect(() => {
    setFilters(defaultFilters);
  }, [debouncedQuery]);

  const result = useApi(canSearch ? `search:${debouncedQuery.toLowerCase()}` : null, (signal) =>
    searchPlaces(debouncedQuery, signal),
  );

  const places = result.status === "success" ? result.data : [];
  const shown = useMemo(() => filterAndSortPlaces(places, filters), [places, filters]);
  const countries = useMemo(() => countriesIn(places), [places]);

  return (
    <div className="explore-page">
      <header className="page-head">
        <div className="container">
          <p className="eyebrow">Explore</p>
          <h1 className="section-title">
            Where do you want to <em>go</em>?
          </h1>
          <form className="explore-search" role="search" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="explore-input" className="sr-only">
              Search for a city or town
            </label>
            <Icon name="pin" size={20} />
            <input
              id="explore-input"
              type="search"
              placeholder="Search a city or town"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </form>
          <p className="explore-hint muted">
            Results come live from the Open-Meteo place search. Type at least 2 letters.
          </p>
        </div>
      </header>

      <div className="container explore-body">
        {result.status === "idle" && (
          <div className="explore-idle">
            <h2>Not sure yet? Start with one of these</h2>
            <ul className="chip-list">
              {destinations.map((d) => (
                <li key={d.id}>
                  <Link className="chip" to={`/destinations/${d.placeId}`}>
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.status === "loading" && (
          <div aria-busy="true" aria-label="Searching">
            <p className="sr-only" role="status">
              Searching…
            </p>
            <ul className="place-grid">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="skeleton place-skeleton" />
              ))}
            </ul>
          </div>
        )}

        {result.status === "error" && (
          <div className="notice notice-error" role="alert">
            <span>{result.error}</span>
            <button className="btn btn-small" type="button" onClick={result.retry}>
              Try again
            </button>
          </div>
        )}

        {result.status === "success" && places.length === 0 && (
          <div className="notice" role="status">
            No places match “{debouncedQuery}”. Check the spelling, or try a nearby city.
          </div>
        )}

        {result.status === "success" && places.length > 0 && (
          <>
            <div className="filter-bar">
              <div className="chip-group" role="group" aria-label="Type of place">
                {kinds.map((kind) => (
                  <button
                    key={kind.value}
                    type="button"
                    className="chip"
                    aria-pressed={filters.kind === kind.value}
                    onClick={() => setFilters({ ...filters, kind: kind.value })}
                  >
                    {kind.label}
                  </button>
                ))}
              </div>

              <div className="filter-selects">
                <label className="select-label">
                  Country
                  <select
                    className="input"
                    value={filters.country}
                    onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  >
                    <option value="">All countries</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="select-label">
                  Sort by
                  <select
                    className="input"
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value as PlaceSort })}
                  >
                    <option value="relevance">Best match</option>
                    <option value="population">Population</option>
                    <option value="name">Name</option>
                  </select>
                </label>
              </div>
            </div>

            <p className="result-count" role="status">
              {shown.length === places.length
                ? `${places.length} ${places.length === 1 ? "place" : "places"} found`
                : `Showing ${shown.length} of ${places.length} places`}
            </p>

            {shown.length === 0 ? (
              <div className="notice">
                <span>No places match these filters.</span>
                <button className="btn btn-small" type="button" onClick={() => setFilters(defaultFilters)}>
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="place-grid">
                {shown.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
