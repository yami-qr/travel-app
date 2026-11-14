import { Link } from "react-router-dom";
import { sceneForDestination } from "../data/destinations";
import type { Place } from "../services/api/places";
import { formatPopulation } from "../utils/stats";
import FavouriteButton from "./FavouriteButton";
import Scenery from "./Scenery";

interface PlaceCardProps {
  place: Place;
}

/** A search result: a small illustrated card linking to the destination page. */
export default function PlaceCard({ place }: PlaceCardProps) {
  const scene = sceneForDestination(`${place.name} ${place.country}`);
  const population = formatPopulation(place.population);

  return (
    <li className="place-card">
      <span className="place-picture">
        <Scenery variant={scene.scene} palette={scene.palette} />
        {place.countryCode && (
          <span className="place-code" aria-hidden="true">
            {place.countryCode}
          </span>
        )}
      </span>
      <div className="place-body">
        <h3>
          <Link to={`/destinations/${place.id}`}>{place.name}</Link>
        </h3>
        <p className="muted">{[place.region, place.country].filter(Boolean).join(", ")}</p>
        {population && <p className="place-meta">Population {population}</p>}
      </div>
      <FavouriteButton place={place} />
    </li>
  );
}
