import type { Trip } from "../types/trip";
import TripCard from "./TripCard";
import TripStats from "./TripStats";

interface TripsSectionProps {
  trips: Trip[];
  onPlanTrip: () => void;
}

export default function TripsSection({ trips, onPlanTrip }: TripsSectionProps) {
  return (
    <section className="trips-section" id="trips" aria-labelledby="trips-heading">
      <div className="container">
        <div className="trips-top">
          <div className="trips-intro">
            <p className="eyebrow">Your travels</p>
            <h2 id="trips-heading" className="section-title">
              My trips. <span className="accent">All in one place.</span>
            </h2>
            <p className="section-lede">
              Every trip you plan is saved here. Open one to add activities, check the budget and
              tick off your packing list.
            </p>
          </div>

          <TripStats trips={trips} />
        </div>

        {trips.length === 0 ? (
          <div className="trips-empty">
            <p className="empty-state">No trips yet. Create one to get started.</p>
            <button className="btn btn-primary" type="button" onClick={onPlanTrip}>
              Plan your first trip
            </button>
          </div>
        ) : (
          <ul className="trip-list">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
