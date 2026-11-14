import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { destinations } from "../data/destinations";
import Icon from "./Icon";
import Postcard from "./Postcard";

const popular = destinations.slice(0, 5);
const [front, middle, back] = [destinations[0], destinations[7], destinations[1]];

export default function HomeHero() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  }

  return (
    <section className="home-hero" aria-labelledby="hero-heading">
      <div className="container home-hero-inner">
        <div className="home-hero-copy">
          <p className="eyebrow">Your travel journal</p>

          <h1 id="hero-heading">
            Every great trip starts with a{" "}
            <span className="scribble">
              <em>where</em>
              <svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">
                <path d="M4 14C40 4 80 4 110 9s60 6 86-3" />
              </svg>
            </span>
            .
          </h1>

          <p className="home-hero-lede">
            Search any city or town to read about it, check the week's weather and browse the
            sights nearby. Save the places you love, then build your trip one day at a time.
          </p>

          <form className="hero-search" onSubmit={handleSubmit} role="search">
            <label htmlFor="hero-search-input" className="sr-only">
              Search for a destination
            </label>
            <Icon name="pin" size={20} />
            <input
              id="hero-search-input"
              type="search"
              placeholder="Search a city, e.g. Porto"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            <button className="btn btn-primary" type="submit">
              Explore
            </button>
          </form>

          <div className="hero-popular">
            <span id="popular-label">Popular:</span>
            <ul aria-labelledby="popular-label">
              {popular.map((place) => (
                <li key={place.id}>
                  <Link className="chip" to={`/destinations/${place.placeId}`}>
                    {place.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="postcard-stack">
          <Postcard destination={back} className="is-back" />
          <Postcard destination={middle} className="is-middle" />
          <Postcard destination={front} className="is-front" postmark />
        </div>
      </div>
    </section>
  );
}
