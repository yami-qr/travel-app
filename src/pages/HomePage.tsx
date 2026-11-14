import CallToAction from "../components/CallToAction";
import DestinationsSection from "../components/DestinationsSection";
import FeaturesSection from "../components/FeaturesSection";
import Hero from "../components/Hero";
import TechSection from "../components/TechSection";
import TripsSection from "../components/TripsSection";
import type { Trip } from "../types/trip";

interface HomePageProps {
  trips: Trip[];
  /** Opens the new-trip form, optionally with a destination filled in. */
  onPlanTrip: (destination?: string) => void;
}

export default function HomePage({ trips, onPlanTrip }: HomePageProps) {
  const planBlankTrip = () => onPlanTrip();

  return (
    <>
      <Hero featuredTrip={trips[0]} onPlanTrip={onPlanTrip} />
      <DestinationsSection onPlanTrip={onPlanTrip} />
      <FeaturesSection onPlanTrip={planBlankTrip} />
      <TripsSection trips={trips} onPlanTrip={planBlankTrip} />
      <CallToAction onPlanTrip={planBlankTrip} />
      <TechSection />
    </>
  );
}
