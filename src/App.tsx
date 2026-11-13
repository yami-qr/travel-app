import { useEffect, useState } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";
import NewTripForm from "./components/NewTripForm";
import TripCard from "./components/TripCard";
import TripDetailPage from "./pages/TripDetailPage";
import { loadTrips, saveTrips } from "./services/storage";
import type { Trip } from "./types/trip";
import { dateRange } from "./utils/trips";

// Default trips, shown on the first visit before anything has been saved.
const sampleTrips: Trip[] = [
  {
    id: "trip-1",
    name: "Lisbon weekend",
    destination: "Lisbon, Portugal",
    startDate: "2027-03-12",
    endDate: "2027-03-15",
    budget: 600,
    days: dateRange("2027-03-12", "2027-03-15").map((date) => ({
      date,
      activities:
        date === "2027-03-12"
          ? [
              { id: "a1", title: "Airport transfer", time: "10:30", cost: 20, category: "transport" as const },
              { id: "a2", title: "Pastéis de Belém", time: "15:00", cost: 8, category: "food" as const },
            ]
          : [],
    })),
    packing: [{ id: "p1", label: "Passport", packed: false }],
  },
  {
    id: "trip-2",
    name: "Kyoto spring",
    destination: "Kyoto, Japan",
    startDate: "2027-04-02",
    endDate: "2027-04-09",
    budget: 1800,
    days: dateRange("2027-04-02", "2027-04-09").map((date) => ({ date, activities: [] })),
    packing: [],
  },
];

interface TripRouteProps {
  trips: Trip[];
  onUpdate: (trip: Trip) => void;
}

function TripRoute({ trips, onUpdate }: TripRouteProps) {
  const { tripId } = useParams();
  const trip = trips.find((t) => t.id === tripId);

  if (!trip) {
    return (
      <p className="empty-state">
        Trip not found. <Link to="/">Back to all trips</Link>
      </p>
    );
  }

  return <TripDetailPage trip={trip} onUpdate={onUpdate} />;
}

export default function App() {
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips() ?? sampleTrips);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    saveTrips(trips);
  }, [trips]);

  function handleCreateTrip(trip: Trip) {
    setTrips((prev) => [trip, ...prev]);
    setShowForm(false);
  }

  function handleUpdateTrip(updated: Trip) {
    setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  return (
    <>
      <header className="site-header">
        <Link to="/" className="logo">
          Itinera
        </Link>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => setShowForm(true)}
          hidden={showForm}
        >
          New trip
        </button>
      </header>

      <main className="container">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {showForm && (
                  <NewTripForm onCreate={handleCreateTrip} onCancel={() => setShowForm(false)} />
                )}

                <section className="trips" aria-labelledby="trips-heading">
                  <h2 id="trips-heading">My trips</h2>

                  {trips.length === 0 ? (
                    <p className="empty-state">No trips yet. Create one to get started.</p>
                  ) : (
                    <ul className="trip-list">
                      {trips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} />
                      ))}
                    </ul>
                  )}
                </section>
              </>
            }
          />
          <Route
            path="/trips/:tripId"
            element={<TripRoute trips={trips} onUpdate={handleUpdateTrip} />}
          />
        </Routes>
      </main>
    </>
  );
}
