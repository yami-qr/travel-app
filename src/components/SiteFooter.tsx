import { Link } from "react-router-dom";
import { REPO_URL } from "../data/site";
import Logo from "./Logo";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="site-footer-about">
          <Link to="/" className="logo" aria-label="Travel Planner home">
            <Logo />
          </Link>
          <p>
            Find a place, save it, and plan the days. Your trips and saved places stay in this
            browser.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="footer-heading">Plan</h2>
          <Link to="/explore">Explore destinations</Link>
          <Link to="/#trips">My trips</Link>
          <Link to="/#saved">Saved places</Link>
        </nav>

        <div>
          <h2 className="footer-heading">Data</h2>
          <p className="footer-credits">
            Places and weather from <a href="https://open-meteo.com/">Open-Meteo</a>. Descriptions,
            photos and sights from <a href="https://www.wikipedia.org/">Wikipedia</a>.
          </p>
          <p className="footer-credits">
            <a href={REPO_URL}>Source code on GitHub</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
