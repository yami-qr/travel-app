import { useState } from "react";
import NewTripForm from "./components/NewTripForm";
import TripCard from "./components/TripCard";
import type { Trip } from "./types/trip";

// Temporary sample data until trips can be saved between visits.
const sampleTrips: Trip[] = [
  {
    id: "trip-1",
    name: "Lisbon weekend",
    destination: "Lisbon, Portugal",
    startDate: "2027-03-12",
    endDate: "2027-03-15",
    budget: 600,
    days: [
      {
        date: "2027-03-12",
        activities: [
          { id: "a1", title: "Airport transfer", time: "10:30", cost: 20, category: "transport" },
          { id: "a2", title: "Pastéis de Belém", time: "15:00", cost: 8, category: "food" },
        ],
      },
    ],
    packing: [{ id: "p1", label: "Passport", packed: false }],
  },
  {
    id: "trip-2",
    name: "Kyoto spring",
    destination: "Kyoto, Japan",
    startDate: "2027-04-02",
    endDate: "2027-04-09",
    budget: 1800,
    days: [],
    packing: [],
  },
];

export default function App() {
  const [trips, setTrips] = useState<Trip[]>(sampleTrips);
  const [showForm, setShowForm] = useState(false);

  function handleCreateTrip(trip: Trip) {
    setTrips((prev) => [trip, ...prev]);
    setShowForm(false);
  }

  return (
    <>
      <header className="site-header">
        <h1 className="logo">Itinera</h1>
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
      </main>
    </>
  );
}
