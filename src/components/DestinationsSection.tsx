import { destinationLabel, destinations } from "../data/destinations";
import Icon from "./Icon";
import Scenery from "./Scenery";

interface DestinationsSectionProps {
  /** Opens the new-trip form with this destination filled in. */
  onPlanTrip: (destination: string) => void;
}

export default function DestinationsSection({ onPlanTrip }: DestinationsSectionProps) {
  return (
    <section
      className="destinations-section"
      id="destinations"
      aria-labelledby="destinations-heading"
    >
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Destinations</p>
          <h2 id="destinations-heading" className="section-title">
            Don't just daydream. <span className="accent">Pick your next adventure.</span>
          </h2>
          <p className="section-lede">
            Choose a place to start a trip there. You can change the destination before you save.
          </p>
        </div>

        <ul className="country-row" aria-label="Countries">
          {destinations.map((destination) => (
            <li key={destination.id}>
              <button
                className="country-button"
                type="button"
                onClick={() => onPlanTrip(destination.country)}
                aria-label={`Plan a trip to ${destination.country}`}
              >
                <span className="country-art">
                  <Scenery variant={destination.scene} palette={destination.palette} />
                </span>
                <span>{destination.country}</span>
              </button>
            </li>
          ))}
        </ul>

        <h3 className="destinations-subhead">Places to start with</h3>

        <ul className="destination-grid">
          {destinations.map((destination) => (
            <li key={destination.id}>
              <button
                className="destination-card"
                type="button"
                onClick={() => onPlanTrip(destinationLabel(destination))}
                aria-label={`Plan a trip to ${destinationLabel(destination)}`}
              >
                <Scenery variant={destination.scene} palette={destination.palette} />
                <span className="destination-card-text">
                  <strong>{destination.name}</strong>
                  <span>{destination.country}</span>
                </span>
                <span className="destination-card-go">
                  <Icon name="arrow" size={16} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
