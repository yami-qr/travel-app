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
            A trip planner built with React and TypeScript. Your trips never leave this browser.
          </p>
        </div>

        <nav aria-label="Footer">
          <Link to="/#trips">My trips</Link>
          <Link to="/#destinations">Destinations</Link>
          <Link to="/#features">Features</Link>
          <a href={REPO_URL}>Source on GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
