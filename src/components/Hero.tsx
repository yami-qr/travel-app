import { useState, type FormEvent } from "react";
import { destinationLabel, destinations } from "../data/destinations";
import type { Trip } from "../types/trip";
import Icon from "./Icon";
import PhonePreview from "./PhonePreview";

interface HeroProps {
  /** Trip shown in the phone preview. */
  featuredTrip?: Trip;
  /** Opens the new-trip form with this destination filled in. */
  onPlanTrip: (destination: string) => void;
}

const quickPicks = destinations.slice(0, 6);

export default function Hero({ featuredTrip, onPlanTrip }: HeroProps) {
  const [destination, setDestination] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onPlanTrip(destination.trim());
  }

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <svg
        className="hero-ribbon"
        viewBox="0 0 800 700"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hero-ribbon-gradient" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b3f45" />
            <stop offset="0.55" stopColor="#17666e" />
            <stop offset="1" stopColor="#1dc98c" />
          </linearGradient>
        </defs>
        <path
          d="M900 -40C640 40 820 250 560 310S250 470 420 600 720 700 560 860"
          fill="none"
          stroke="url(#hero-ribbon-gradient)"
          strokeWidth="150"
          strokeLinecap="round"
        />
      </svg>

      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="hero-badge">
            <Icon name="check" size={14} />
            Free trip planner, no sign-up
          </p>

          <h1 id="hero-heading">
            Dream it up.
            <span>
              Plan it <span className="accent">day by day.</span>
            </span>
          </h1>

          <p className="hero-lede">
            Travel Planner turns a destination, your dates and a budget into a day-by-day plan. Add
            activities, watch your spending and tick off your packing list, all in one place.
          </p>

          <form className="hero-search" onSubmit={handleSubmit}>
            <label htmlFor="hero-destination">Where to?</label>
            <div className="hero-search-row">
              <input
                id="hero-destination"
                type="text"
                placeholder="e.g. Lisbon, Portugal"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                Plan a trip
                <Icon name="arrow" size={16} />
              </button>
            </div>
          </form>

          <div className="hero-picks">
            <span id="hero-picks-label">Try:</span>
            <ul aria-labelledby="hero-picks-label">
              {quickPicks.map((pick) => (
                <li key={pick.id}>
                  <button
                    className="chip"
                    type="button"
                    onClick={() => onPlanTrip(destinationLabel(pick))}
                  >
                    {pick.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hero-visual">
          <span className="float-bubble bubble-plane" aria-hidden="true">
            <Icon name="plane" size={22} />
          </span>
          <span className="float-bubble bubble-wallet" aria-hidden="true">
            <Icon name="wallet" size={22} />
          </span>
          <span className="float-bubble bubble-bag" aria-hidden="true">
            <Icon name="bag" size={22} />
          </span>
          <span className="float-bubble bubble-pin" aria-hidden="true">
            <Icon name="pin" size={22} />
          </span>
          <PhonePreview trip={featuredTrip} />
        </div>
      </div>
    </section>
  );
}
