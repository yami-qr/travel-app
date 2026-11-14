import { Link } from "react-router-dom";
import { destinations } from "../data/destinations";
import FavouriteButton from "./FavouriteButton";
import Scenery from "./Scenery";

/** Curated destinations shown as a sheet of postage stamps. Each opens the live destination page. */
export default function StampCollection() {
  return (
    <section className="stamps-section" id="destinations" aria-labelledby="stamps-heading">
      <div className="container">
        <div className="section-head-row">
          <div className="section-head">
            <p className="eyebrow">Where to start</p>
            <h2 id="stamps-heading" className="section-title">
              A sheet of <em>stamps</em> from around the world
            </h2>
            <p className="section-lede">
              Ten places we love. Open one for its live weather and nearby sights, or save it for
              later.
            </p>
          </div>
          <Link className="btn" to="/explore">
            Search anywhere
          </Link>
        </div>

        <ul className="stamp-grid">
          {destinations.map((place, index) => (
            <li key={place.id} className="stamp-item">
              <Link className="stamp" to={`/destinations/${place.placeId}`}>
                <span className="stamp-picture">
                  <Scenery variant={place.scene} palette={place.palette} />
                  <span className="stamp-value" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </span>
                <span className="stamp-caption">
                  <strong>{place.name}</strong>
                  <span>{place.country}</span>
                </span>
              </Link>
              <FavouriteButton
                place={{
                  id: place.placeId,
                  name: place.name,
                  country: place.country,
                  countryCode: place.countryCode,
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
