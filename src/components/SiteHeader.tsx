import { Link, NavLink } from "react-router-dom";
import { useFavourites } from "../context/FavouritesContext";
import Logo from "./Logo";

interface SiteHeaderProps {
  onNewTrip: () => void;
}

export default function SiteHeader({ onNewTrip }: SiteHeaderProps) {
  const { favourites } = useFavourites();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container site-header-inner">
          <Link to="/" className="logo" aria-label="Travel Planner home">
            <Logo />
          </Link>

          <nav className="site-nav" aria-label="Main">
            <NavLink to="/explore">Explore</NavLink>
            <Link to="/#trips">My trips</Link>
            <Link to="/#saved">
              Saved
              {favourites.length > 0 && (
                <span className="nav-count" aria-label={`${favourites.length} saved`}>
                  {favourites.length}
                </span>
              )}
            </Link>
          </nav>

          <button className="btn btn-primary" type="button" onClick={onNewTrip}>
            New trip
          </button>
        </div>
      </header>
    </>
  );
}
