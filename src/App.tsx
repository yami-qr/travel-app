import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "./components/Modal";
import NewTripForm, { NEW_TRIP_TITLE_ID } from "./components/NewTripForm";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import { sampleTrips } from "./data/sampleTrips";
import HomePage from "./pages/HomePage";
import TripDetailPage from "./pages/TripDetailPage";
import { loadTrips, saveTrips } from "./services/storage";
import type { Trip } from "./types/trip";

interface TripRouteProps {
  trips: Trip[];
  onUpdate: (trip: Trip) => void;
}

function TripRoute({ trips, onUpdate }: TripRouteProps) {
  const { tripId } = useParams();
  const trip = trips.find((t) => t.id === tripId);

  if (!trip) {
    return (
      <div className="container not-found">
        <h1 className="section-title">Trip not found</h1>
        <p className="muted">It may have been removed, or the link is wrong.</p>
        <Link className="btn btn-primary" to="/">
          Back to all trips
        </Link>
      </div>
    );
  }

  return <TripDetailPage trip={trip} onUpdate={onUpdate} />;
}

/** Scrolls to the section named in the URL hash, or to the top when the page changes. */
function useScrollOnNavigate() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // scrollIntoView is missing in some test environments, hence the optional call.
      document.getElementById(hash.slice(1))?.scrollIntoView?.();
    } else {
      document.documentElement.scrollTop = 0;
    }
  }, [pathname, hash]);
}

export default function App() {
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips() ?? sampleTrips);
  // null means the form is closed; a string is the destination to pre-fill.
  const [formDestination, setFormDestination] = useState<string | null>(null);
  const navigate = useNavigate();

  useScrollOnNavigate();

  useEffect(() => {
    saveTrips(trips);
  }, [trips]);

  function openForm(destination = "") {
    setFormDestination(destination);
  }

  function closeForm() {
    setFormDestination(null);
  }

  function handleCreateTrip(trip: Trip) {
    setTrips((prev) => [trip, ...prev]);
    closeForm();
    // Go straight to the new trip, so activities can be added.
    navigate(`/trips/${trip.id}`);
  }

  function handleUpdateTrip(updated: Trip) {
    setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  return (
    <>
      <SiteHeader onNewTrip={() => openForm()} />

      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage trips={trips} onPlanTrip={openForm} />} />
          <Route
            path="/trips/:tripId"
            element={<TripRoute trips={trips} onUpdate={handleUpdateTrip} />}
          />
        </Routes>
      </main>

      <SiteFooter />

      {formDestination !== null && (
        <Modal labelledBy={NEW_TRIP_TITLE_ID} onClose={closeForm}>
          <NewTripForm
            onCreate={handleCreateTrip}
            onCancel={closeForm}
            initialDestination={formDestination}
          />
        </Modal>
      )}
    </>
  );
}
