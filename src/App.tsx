import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "./components/Modal";
import NewTripForm, { NEW_TRIP_TITLE_ID } from "./components/NewTripForm";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import { FavouritesProvider } from "./context/FavouritesContext";
import { sampleTrips } from "./data/sampleTrips";
import DestinationPage from "./pages/DestinationPage";
import ExplorePage from "./pages/ExplorePage";
import HomePage from "./pages/HomePage";
import TripDetailPage from "./pages/TripDetailPage";
import { loadTrips, saveTrips } from "./services/storage";
import type { Trip } from "./types/trip";
import { addActivity } from "./utils/itinerary";

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

  /** Adds a sight from a destination page to one day of a trip, as a free activity. */
  function handleAddSightToTrip(tripId: string, date: string, title: string) {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? addActivity(t, date, { title, time: "", cost: "0", category: "activity" })
          : t,
      ),
    );
  }

  return (
    <FavouritesProvider>
      <SiteHeader onNewTrip={() => openForm()} />

      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage trips={trips} onPlanTrip={openForm} />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route
            path="/destinations/:placeId"
            element={
              <DestinationPage
                trips={trips}
                onPlanTrip={openForm}
                onAddToTrip={handleAddSightToTrip}
              />
            }
          />
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
    </FavouritesProvider>
  );
}
