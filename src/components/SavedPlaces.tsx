import { Link } from "react-router-dom";
import { useFavourites } from "../context/FavouritesContext";
import { sceneForDestination } from "../data/destinations";
import FavouriteButton from "./FavouriteButton";
import Scenery from "./Scenery";

interface SavedPlacesProps {
  /** Starts a trip to the saved place. */
  onPlanTrip: (destination: string) => void;
}

/** The destinations a person has saved with the heart button, newest first. */
export default function SavedPlaces({ onPlanTrip }: SavedPlacesProps) {
  const { favourites } = useFavourites();

  return (
    <section className="saved-section" id="saved" aria-labelledby="saved-heading">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Saved places</p>
          <h2 id="saved-heading" className="section-title">
            Your <em>wish list</em>
          </h2>
        </div>

        {favourites.length === 0 ? (
          <div className="notice">
            <span>
              Nothing saved yet. Tap the heart on any destination to keep it here for later.
            </span>
            <Link className="btn btn-small" to="/explore">
              Find a place
            </Link>
          </div>
        ) : (
          <ul className="saved-list">
            {favourites.map((place) => {
              const scene = sceneForDestination(`${place.name} ${place.country}`);
              const label = place.country ? `${place.name}, ${place.country}` : place.name;
              return (
                <li key={place.id} className="saved-card">
                  <span className="saved-picture">
                    <Scenery variant={scene.scene} palette={scene.palette} />
                  </span>
                  <div className="saved-body">
                    <h3>
                      <Link to={`/destinations/${place.id}`}>{place.name}</Link>
                    </h3>
                    <p className="muted">
                      {place.region ? `${place.region}, ` : ""}
                      {place.country}
                    </p>
                    <button
                      className="btn btn-small"
                      type="button"
                      onClick={() => onPlanTrip(label)}
                      aria-label={`Plan a trip to ${label}`}
                    >
                      Plan a trip
                    </button>
                  </div>
                  <FavouriteButton place={place} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
