import Icon, { type IconName } from "./Icon";

const steps: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "pin",
    title: "Discover",
    text: "Search any city. We pull in a description, a 7-day forecast and the sights nearby.",
  },
  {
    icon: "calendar",
    title: "Plan",
    text: "Create a trip and add sights straight to a day. Reorder until the day flows.",
  },
  {
    icon: "bag",
    title: "Pack",
    text: "Keep an eye on the budget and tick things off your packing list before you go.",
  },
];

/** Three steps joined by a dashed route line. */
export default function HowItWorks() {
  return (
    <section className="how-section" aria-labelledby="how-heading">
      <div className="container">
        <div className="section-head how-head">
          <p className="eyebrow">How it works</p>
          <h2 id="how-heading" className="section-title">
            From <em>maybe</em> to boarding in three stops
          </h2>
        </div>

        <ol className="how-steps">
          {steps.map((step, index) => (
            <li key={step.title} className="how-step">
              <span className="how-marker">
                <Icon name={step.icon} size={22} />
                <span className="how-number" aria-hidden="true">
                  {index + 1}
                </span>
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
