import TripsSection from "../components/TripsSection";
import type { Trip } from "../types/trip";

interface HomePageProps {
  trips: Trip[];
  /** Opens the new-trip form, optionally with a destination filled in. */
  onPlanTrip: (destination?: string) => void;
}

export default function HomePage({ trips, onPlanTrip }: HomePageProps) {
  return (
    <>
      <TripsSection trips={trips} onPlanTrip={() => onPlanTrip()} />
    </>
  );
}
