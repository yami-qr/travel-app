import { useMemo, useState } from "react";
import { useApi } from "../hooks/useApi";
import {
  attractionCategoryLabels,
  getAttractions,
  type AttractionCategory,
} from "../services/api/wikipedia";
import type { Trip } from "../types/trip";
import AddToTrip from "./AddToTrip";

interface AttractionsSectionProps {
  latitude: number;
  longitude: number;
  trips: Trip[];
  preferredTripId?: string;
  onAddToTrip: (tripId: string, date: string, title: string) => void;
  onCreateTrip: () => void;
}

const PAGE_SIZE = 12;

/** Sights near a destination from Wikipedia, with category chips, a text filter and "add to trip". */
export default function AttractionsSection({
  latitude,
  longitude,
  trips,
  preferredTripId,
  onAddToTrip,
  onCreateTrip,
}: AttractionsSectionProps) {
  const [category, setCategory] = useState<AttractionCategory | "all">("all");
  const [text, setText] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const result = useApi(`sights:${latitude.toFixed(3)},${longitude.toFixed(3)}`, (signal) =>
    getAttractions(latitude, longitude, signal),
  );

  const attractions = useMemo(() => (result.status === "success" ? result.data : []), [result]);

  // Only offer categories that actually appear, with how many of each.
  const categoryCounts = useMemo(() => {
    const counts = new Map<AttractionCategory, number>();
    for (const a of attractions) counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
    return counts;
  }, [attractions]);

  const filtered = useMemo(() => {
    const needle = text.trim().toLowerCase();
    return attractions.filter(
      (a) =>
        (category === "all" || a.category === category) &&
        (!needle ||
          a.title.toLowerCase().includes(needle) ||
          (a.description ?? "").toLowerCase().includes(needle)),
    );
  }, [attractions, category, text]);

  const visible = filtered.slice(0, limit);

  return (
    <section className="attractions" aria-labelledby="sights-heading">
      <div className="attractions-head">
        <h2 id="sights-heading" className="section-title">
          Things to <em>see</em> nearby
        </h2>
        <p className="muted">Places with a Wikipedia article within 10 km of the centre.</p>
      </div>

      {result.status === "loading" && (
        <ul className="sight-grid" aria-busy="true" aria-label="Loading sights">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="skeleton sight-skeleton" />
          ))}
        </ul>
      )}

      {result.status === "error" && (
        <div className="notice notice-error" role="alert">
          <span>Couldn't load nearby sights. {result.error}</span>
          <button className="btn btn-small" type="button" onClick={result.retry}>
            Try again
          </button>
        </div>
      )}

      {result.status === "success" && attractions.length === 0 && (
        <div className="notice">We couldn't find any sights listed near here.</div>
      )}

      {result.status === "success" && attractions.length > 0 && (
        <>
          <div className="filter-bar">
            <div className="chip-group" role="group" aria-label="Category">
              <button
                type="button"
                className="chip"
                aria-pressed={category === "all"}
                onClick={() => {
                  setCategory("all");
                  setLimit(PAGE_SIZE);
                }}
              >
                All <span className="chip-count">{attractions.length}</span>
              </button>
              {(Object.keys(attractionCategoryLabels) as AttractionCategory[])
                .filter((c) => categoryCounts.has(c))
                .map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="chip"
                    aria-pressed={category === c}
                    onClick={() => {
                      setCategory(c);
                      setLimit(PAGE_SIZE);
                    }}
                  >
                    {attractionCategoryLabels[c]} <span className="chip-count">{categoryCounts.get(c)}</span>
                  </button>
                ))}
            </div>

            <label className="select-label">
              <span className="sr-only">Filter sights by name</span>
              <input
                className="input"
                type="search"
                placeholder="Filter by name"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setLimit(PAGE_SIZE);
                }}
              />
            </label>
          </div>

          <p className="result-count" role="status">
            {filtered.length === attractions.length
              ? `${attractions.length} sights`
              : `${filtered.length} of ${attractions.length} sights`}
          </p>

          {filtered.length === 0 ? (
            <div className="notice">No sights match. Try another category or name.</div>
          ) : (
            <ul className="sight-grid">
              {visible.map((sight) => (
                <li key={sight.id} className="sight-card">
                  <div className="sight-picture">
                    {sight.imageUrl ? (
                      <img src={sight.imageUrl} alt="" loading="lazy" />
                    ) : (
                      <span className="sight-placeholder" aria-hidden="true">
                        {sight.title.charAt(0)}
                      </span>
                    )}
                    <span className="sight-tag">{attractionCategoryLabels[sight.category]}</span>
                  </div>
                  <div className="sight-body">
                    <h3>{sight.title}</h3>
                    {sight.description && <p className="muted">{sight.description}</p>}
                    <p className="sight-meta">
                      {sight.distanceKm < 1
                        ? `${Math.round(sight.distanceKm * 1000)} m from the centre`
                        : `${sight.distanceKm.toFixed(1)} km from the centre`}
                      {" · "}
                      <a href={sight.pageUrl} target="_blank" rel="noreferrer">
                        Read more<span className="sr-only"> about {sight.title} on Wikipedia</span>
                      </a>
                    </p>
                    <AddToTrip
                      title={sight.title}
                      trips={trips}
                      preferredTripId={preferredTripId}
                      onAdd={(tripId, date) => onAddToTrip(tripId, date, sight.title)}
                      onCreateTrip={onCreateTrip}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {filtered.length > limit && (
            <div className="more-row">
              <button className="btn" type="button" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
                Show more sights
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
