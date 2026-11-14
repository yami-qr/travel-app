import { useId } from "react";
import type { Destination } from "../data/destinations";
import Scenery from "./Scenery";

interface PostcardProps {
  destination: Destination;
  className?: string;
  /** Adds the round postmark that overlaps the corner. */
  postmark?: boolean;
}

/** A picture postcard of a destination: illustration, "Greetings from" caption and a stamp. Decorative. */
export default function Postcard({ destination, className = "", postmark = false }: PostcardProps) {
  const pathId = `postmark-${useId().replace(/:/g, "")}`;

  return (
    <figure className={`postcard ${className}`} aria-hidden="true">
      <div className="postcard-picture">
        <Scenery variant={destination.scene} palette={destination.palette} />
      </div>
      <figcaption>
        <span>Greetings from</span>
        <strong>{destination.name}</strong>
      </figcaption>
      <span className="postcard-stamp">
        <Scenery variant={destination.scene} palette={destination.palette} />
      </span>

      {postmark && (
        <svg className="postmark" viewBox="0 0 120 120">
          <defs>
            <path id={pathId} d="M60 60m-42 0a42 42 0 1 1 84 0a42 42 0 1 1-84 0" />
          </defs>
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text fontSize="11" fontWeight="700" letterSpacing="2.4" fill="currentColor">
            <textPath href={`#${pathId}`}>TRAVEL PLANNER • {destination.country.toUpperCase()} •</textPath>
          </text>
          <text x="60" y="57" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
            PAR
          </text>
          <text x="60" y="71" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
            AVION
          </text>
        </svg>
      )}
    </figure>
  );
}
