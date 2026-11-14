import Icon from "./Icon";

interface CallToActionProps {
  onPlanTrip: () => void;
}

export default function CallToAction({ onPlanTrip }: CallToActionProps) {
  return (
    <section className="cta-section" aria-labelledby="cta-heading">
      <svg
        className="cta-ribbon"
        viewBox="0 0 1200 500"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cta-ribbon-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1dc98c" />
            <stop offset="0.5" stopColor="#17666e" />
            <stop offset="1" stopColor="#0b3f45" />
          </linearGradient>
        </defs>
        <path
          d="M-80 120C180 -40 320 300 560 220S860 40 1010 240 1180 520 1320 380"
          fill="none"
          stroke="url(#cta-ribbon-gradient)"
          strokeWidth="130"
          strokeLinecap="round"
        />
      </svg>

      <div className="container">
        <div className="cta-card">
          <h2 id="cta-heading" className="section-title">
            Your next trip <span className="accent">starts here.</span>
          </h2>
          <p>Pick a place, set your dates and budget, and build the plan one day at a time.</p>
          <button className="btn btn-primary btn-large" type="button" onClick={onPlanTrip}>
            Plan your next trip
            <Icon name="arrow" size={18} />
          </button>
          <p className="cta-note">Free to use · No account · Saved in your browser</p>
        </div>
      </div>
    </section>
  );
}
