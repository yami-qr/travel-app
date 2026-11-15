import { Link, useParams } from "react-router-dom";
import AttractionsSection from "../components/AttractionsSection";
import FavouriteButton from "../components/FavouriteButton";
import WeatherStrip from "../components/WeatherStrip";
import { useApi } from "../hooks/useApi";
import { getPlace, placeLabel, type Place } from "../services/api/places";
import { getDestinationSummary } from "../services/api/wikipedia";
import type { Trip } from "../types/trip";
import { formatPopulation } from "../utils/stats";

interface DestinationPageProps {
  trips: Trip[];
  onPlanTrip: (destination: string) => void;
  onAddToTrip: (tripId: string, date: string, title: string) => void;
}

/** Local time at the destination, e.g. "14:05", or "" when the time zone is unknown. */
function localTime(timezone: string | undefined): string {
  if (!timezone) return "";
  try {
    return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: timezone });
  } catch {
    return "";
  }
}

function Overview({ place }: { place: Place }) {
  const summary = useApi(`summary:${place.id}`, (signal) => getDestinationSummary(place, signal));

  if (summary.status === "loading") {
    return (
      <div className="overview" aria-busy="true" aria-label="Loading the description">
        <div className="skeleton overview-image-skeleton" />
        <div className="overview-text">
          <span className="skeleton line-skeleton" />
          <span className="skeleton line-skeleton" />
          <span className="skeleton line-skeleton short" />
        </div>
      </div>
    );
  }

  if (summary.status === "error") {
    return (
      <div className="notice notice-error" role="alert">
        <span>Couldn't load the description. {summary.error}</span>
        <button className="btn btn-small" type="button" onClick={summary.retry}>
          Try again
        </button>
      </div>
    );
  }

  if (summary.status !== "success" || !summary.data) {
    return <div className="notice">There's no Wikipedia article for {place.name} yet.</div>;
  }

  const { data } = summary;
  return (
    <div className="overview">
      {data.imageUrl && (
        <figure className="overview-photo">
          <img src={data.imageUrl} alt={`View of ${place.name}`} />
        </figure>
      )}
      <div className="overview-text">
        {data.description && <p className="overview-tagline">{data.description}</p>}
        <p>{data.extract}</p>
        <p className="credit">
          From{" "}
          <a href={data.pageUrl} target="_blank" rel="noreferrer">
            Wikipedia
          </a>
          , available under CC BY-SA.
        </p>
      </div>
    </div>
  );
}

export default function DestinationPage({ trips, onPlanTrip, onAddToTrip }: DestinationPageProps) {
  const { placeId } = useParams();
  const id = Number(placeId);
  const valid = Number.isInteger(id) && id > 0;

  const place = useApi(valid ? `place:${id}` : null, (signal) => getPlace(id, signal));

  if (!valid || (place.status === "error" && /couldn't find/i.test(place.error))) {
    return (
      <div className="container not-found">
        <h1 className="section-title">We couldn't find that place</h1>
        <p className="muted">The link may be wrong. Try searching for it instead.</p>
        <Link className="btn btn-primary" to="/explore">
          Search destinations
        </Link>
      </div>
    );
  }

  if (place.status === "error") {
    return (
      <div className="container page-pad">
        <div className="notice notice-error" role="alert">
          <span>{place.error}</span>
          <button className="btn btn-small" type="button" onClick={place.retry}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (place.status !== "success") {
    return (
      <div className="container page-pad" aria-busy="true">
        <p className="sr-only" role="status">
          Loading destination…
        </p>
        <span className="skeleton title-skeleton" />
        <span className="skeleton line-skeleton" />
      </div>
    );
  }

  const p = place.data;
  const label = placeLabel(p);
  const time = localTime(p.timezone);
  const population = formatPopulation(p.population);
  // Prefer a trip that is already going here.
  const matchingTrip = trips.find((t) => t.destination.toLowerCase().includes(p.name.toLowerCase()));

  return (
    <article className="destination-page">
      <header className="page-head destination-head">
        <div className="container">
          <Link className="back-link" to="/explore">
            ← Explore
          </Link>
          <div className="destination-title-row">
            <div>
              <p className="eyebrow">
                {[p.region, p.country].filter(Boolean).join(", ")}
              </p>
              <h1 className="destination-title">{p.name}</h1>
              <ul className="fact-list">
                {population && <li>Population {population}</li>}
                {time && <li>Local time {time}</li>}
                <li>
                  {p.latitude.toFixed(2)}°, {p.longitude.toFixed(2)}°
                </li>
              </ul>
            </div>
            <div className="destination-actions">
              <FavouriteButton place={p} variant="full" />
              <button className="btn btn-primary" type="button" onClick={() => onPlanTrip(label)}>
                Plan a trip here
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container destination-body">
        <Overview place={p} />
        <WeatherStrip latitude={p.latitude} longitude={p.longitude} />
        <AttractionsSection
          placeName={p.name}
          latitude={p.latitude}
          longitude={p.longitude}
          trips={trips}
          preferredTripId={matchingTrip?.id}
          onAddToTrip={onAddToTrip}
          onCreateTrip={() => onPlanTrip(label)}
        />
      </div>
    </article>
  );
}
