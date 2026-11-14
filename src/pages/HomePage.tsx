import HomeHero from "../components/HomeHero";
import HowItWorks from "../components/HowItWorks";
import SavedPlaces from "../components/SavedPlaces";
import StampCollection from "../components/StampCollection";
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
      <HomeHero />
      <TripsSection trips={trips} onPlanTrip={() => onPlanTrip()} />
      <SavedPlaces onPlanTrip={onPlanTrip} />
      <StampCollection />
      <HowItWorks />
    </>
  );
}
