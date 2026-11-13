import type { ActivityCategory } from "../types/trip";

interface CategoryBreakdownProps {
  totals: Record<ActivityCategory, number>;
}

const labels: Record<ActivityCategory, string> = {
  activity: "Activities",
  food: "Food",
  transport: "Transport",
  stay: "Stay",
};

export default function CategoryBreakdown({ totals }: CategoryBreakdownProps) {
  const categories = Object.keys(labels) as ActivityCategory[];
  const max = Math.max(...categories.map((c) => totals[c]), 0);

  return (
    <section className="breakdown" aria-labelledby="breakdown-heading">
      <h2 id="breakdown-heading">Spending by category</h2>
      <ul className="breakdown-list">
        {categories.map((category) => {
          const amount = totals[category];
          // Scale bars to the largest category; avoid dividing by zero when nothing is spent.
          const width = max > 0 ? (amount / max) * 100 : 0;
          return (
            <li key={category} className="breakdown-row">
              <span className="breakdown-label">{labels[category]}</span>
              <div className="breakdown-track" aria-hidden="true">
                <div className="breakdown-fill" style={{ width: `${width}%` }} />
              </div>
              <span className="breakdown-amount">{amount}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
