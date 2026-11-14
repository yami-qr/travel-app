import TripCard from "../components/TripCard";
import type { Trip } from "../types/trip";

interface HomePageProps {
  trips: Trip[];
  /** Opens the new-trip form, optionally with a destination filled in. */
  onPlanTrip: (destination?: string) => void;
}

export default function HomePage({ trips }: HomePageProps) {
  return (
    <>
      <section className="trips-section" id="trips" aria-labelledby="trips-heading">
        <div className="container">
          <h2 id="trips-heading" className="section-title">
            My trips
          </h2>

          {trips.length === 0 ? (
            <p className="empty-state">No trips yet. Create one to get started.</p>
          ) : (
            <ul className="trip-list">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
