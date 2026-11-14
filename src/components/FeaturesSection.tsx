import { Link } from "react-router-dom";
import { destinations } from "../data/destinations";
import Icon, { type IconName } from "./Icon";
import Scenery from "./Scenery";

interface FeaturesSectionProps {
  onPlanTrip: () => void;
}

const features: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "calendar",
    title: "Day-by-day plans",
    text: "Every date of your trip gets its own day, ready to fill with activities.",
  },
  {
    icon: "list",
    title: "Activities",
    text: "Give each stop a time, a cost and a category, so the day is clear at a glance.",
  },
  {
    icon: "reorder",
    title: "Easy reordering",
    text: "Move activities up or down until the day flows the way you want.",
  },
  {
    icon: "wallet",
    title: "Budget tracker",
    text: "See what you have spent against your budget, with a warning if you go over.",
  },
  {
    icon: "chart",
    title: "Spending breakdown",
    text: "Know how much goes on food, transport, stays and activities.",
  },
  {
    icon: "bag",
    title: "Packing list",
    text: "Add what you need to bring and tick it off as you pack.",
  },
  {
    icon: "bookmark",
    title: "Saved for you",
    text: "Trips are kept in your browser, so they are still here when you come back.",
  },
  {
    icon: "keyboard",
    title: "Keyboard friendly",
    text: "Labelled forms and buttons that you can use without a mouse.",
  },
];

const fanCards = destinations.slice(0, 3);

export default function FeaturesSection({ onPlanTrip }: FeaturesSectionProps) {
  return (
    <section className="features-section" id="features" aria-labelledby="features-heading">
      <div className="container">
        <div className="features-top">
          <div className="features-intro">
            <p className="eyebrow">All-in-one trip planning</p>
            <h2 id="features-heading" className="section-title">
              Your trip planner. <span className="accent">Every tool you need.</span>
            </h2>
            <p>
              From the first idea to the last sock in the bag: plan each day, keep an eye on the
              money and pack without forgetting anything.
            </p>
            <div className="features-actions">
              <button className="btn btn-primary" type="button" onClick={onPlanTrip}>
                Start planning
                <Icon name="arrow" size={16} />
              </button>
              <Link className="btn btn-outline-light" to="/#trips">
                View my trips
              </Link>
            </div>
          </div>

          <div className="card-fan" aria-hidden="true">
            {fanCards.map((card) => (
              <div key={card.id} className="fan-card">
                <Scenery variant={card.scene} palette={card.palette} />
                <div className="fan-card-body">
                  <strong>{card.name}</strong>
                  <span className="fan-line" />
                  <span className="fan-line short" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <ul className="feature-grid">
          {features.map((feature) => (
            <li key={feature.title} className="feature-tile">
              <span className="feature-icon">
                <Icon name={feature.icon} />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
