import type { Trip } from "../types/trip";
import { tripStats } from "../utils/stats";
import TripCard from "./TripCard";

interface TripsSectionProps {
  trips: Trip[];
  onPlanTrip: () => void;
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export default function TripsSection({ trips, onPlanTrip }: TripsSectionProps) {
  const stats = tripStats(trips);

  return (
    <section className="trips-section" id="trips" aria-labelledby="trips-heading">
      <div className="container">
        <div className="section-head-row">
          <div className="section-head">
            <p className="eyebrow">My trips</p>
            <h2 id="trips-heading" className="section-title">
              Your <em>boarding passes</em>
            </h2>
            {trips.length > 0 && (
              <p className="trips-summary">
                {plural(stats.trips, "trip")} · {plural(stats.days, "day")} ·{" "}
                {plural(stats.activities, "activity", "activities")} planned
              </p>
            )}
          </div>
          <button className="btn" type="button" onClick={onPlanTrip}>
            Plan a new trip
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="notice">
            <span>No trips yet. Create one to get started.</span>
            <button className="btn btn-small" type="button" onClick={onPlanTrip}>
              Plan your first trip
            </button>
          </div>
        ) : (
          <ul className="pass-list">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
