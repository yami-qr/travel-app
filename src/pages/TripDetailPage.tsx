import { Link } from "react-router-dom";
import AddActivityForm from "../components/AddActivityForm";
import BudgetBar from "../components/BudgetBar";
import CategoryBreakdown from "../components/CategoryBreakdown";
import PackingList from "../components/PackingList";
import type { Trip } from "../types/trip";
import { spendingByCategory, totalSpent } from "../utils/budget";
import {
  addActivity,
  addPackingItem,
  moveActivity,
  removeActivity,
  togglePackingItem,
} from "../utils/itinerary";
import type { ActivityFormInput } from "../utils/itinerary";

interface TripDetailPageProps {
  trip: Trip;
  onUpdate: (trip: Trip) => void;
}

function formatDay(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export default function TripDetailPage({ trip, onUpdate }: TripDetailPageProps) {
  function handleAddActivity(date: string, input: ActivityFormInput) {
    onUpdate(addActivity(trip, date, input));
  }

  return (
    <article className="trip-detail">
      <p>
        <Link to="/">← All trips</Link>
      </p>

      <header className="trip-detail-header">
        <h1>{trip.name}</h1>
        <p className="muted">
          {trip.destination} · {trip.startDate} to {trip.endDate}
        </p>
        <BudgetBar spent={totalSpent(trip)} budget={trip.budget} />
        <CategoryBreakdown totals={spendingByCategory(trip)} />
      </header>

      {trip.days.length === 0 && <p className="empty-state">This trip has no days yet.</p>}

      {trip.days.map((day) => (
        <section key={day.date} className="day" aria-labelledby={`day-${day.date}`}>
          <h2 id={`day-${day.date}`}>{formatDay(day.date)}</h2>

          {day.activities.length === 0 ? (
            <p className="empty-state">No activities yet.</p>
          ) : (
            <ol className="activity-list">
              {day.activities.map((activity, index) => (
                <li key={activity.id} className="activity-item">
                  <div className="activity-info">
                    <strong>{activity.title}</strong>
                    <span className="muted">
                      {activity.time ? `${activity.time} · ` : ""}
                      {activity.category} · {activity.cost}
                    </span>
                  </div>
                  <div className="activity-actions">
                    <button
                      className="btn btn-small"
                      type="button"
                      onClick={() => onUpdate(moveActivity(trip, day.date, activity.id, -1))}
                      disabled={index === 0}
                      aria-label={`Move ${activity.title} up`}
                    >
                      ↑
                    </button>
                    <button
                      className="btn btn-small"
                      type="button"
                      onClick={() => onUpdate(moveActivity(trip, day.date, activity.id, 1))}
                      disabled={index === day.activities.length - 1}
                      aria-label={`Move ${activity.title} down`}
                    >
                      ↓
                    </button>
                    <button
                      className="btn btn-small"
                      type="button"
                      onClick={() => onUpdate(removeActivity(trip, day.date, activity.id))}
                      aria-label={`Remove ${activity.title}`}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <AddActivityForm date={day.date} onAdd={(input) => handleAddActivity(day.date, input)} />
        </section>
      ))}

      <PackingList
        items={trip.packing}
        onAdd={(label) => onUpdate(addPackingItem(trip, label))}
        onToggle={(id) => onUpdate(togglePackingItem(trip, id))}
      />
    </article>
  );
}
