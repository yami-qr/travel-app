import { Link } from "react-router-dom";
import { REPO_URL } from "../data/site";
import Logo from "./Logo";

interface SiteHeaderProps {
  onNewTrip: () => void;
}

export default function SiteHeader({ onNewTrip }: SiteHeaderProps) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <div className="announce">
        <p>
          Free to use, no account needed. Your trips are saved in this browser.{" "}
          <Link to="/#features">See what it does</Link>
        </p>
      </div>

      <header className="site-header">
        <div className="container site-header-inner">
          <Link to="/" className="logo" aria-label="Travel Planner home">
            <Logo />
          </Link>

          <nav className="site-nav" aria-label="Main">
            <Link to="/#trips">My trips</Link>
            <Link to="/#destinations">Destinations</Link>
            <Link to="/#features">Features</Link>
          </nav>

          <div className="header-actions">
            <a className="btn header-code" href={REPO_URL}>
              View code
            </a>
            <button className="btn btn-primary" type="button" onClick={onNewTrip}>
              New trip
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
