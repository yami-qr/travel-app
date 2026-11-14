import { destinations } from "../data/destinations";
import { REPO_URL } from "../data/site";
import Icon from "./Icon";
import Scenery from "./Scenery";

const stack = [
  "React 18 and TypeScript",
  "Vite for fast builds",
  "React Router for pages",
  "Vitest and Testing Library for tests",
  "localStorage for saving trips",
];

const art = destinations.find((d) => d.scene === "islands") ?? destinations[0];

export default function TechSection() {
  return (
    <section className="tech-section" aria-labelledby="tech-heading">
      <div className="container tech-inner">
        <div className="tech-art" aria-hidden="true">
          <Scenery variant={art.scene} palette={art.palette} />
        </div>

        <div className="tech-copy">
          <p className="eyebrow">Under the hood</p>
          <h2 id="tech-heading" className="section-title">
            The tech stack behind your travel plans
          </h2>
          <p>
            Itinera is a portfolio project. It runs entirely in your browser, with no server and no
            account, and the pictures are drawn in code.
          </p>
          <ul className="check-list">
            {stack.map((item) => (
              <li key={item}>
                <span className="check">
                  <Icon name="check" size={14} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <a className="btn btn-light" href={REPO_URL}>
            View the code
            <Icon name="arrow" size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
