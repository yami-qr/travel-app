import { Link } from "react-router-dom";
import AddActivityForm from "../components/AddActivityForm";
import BudgetBar from "../components/BudgetBar";
import CategoryBreakdown from "../components/CategoryBreakdown";
import Icon, { type IconName } from "../components/Icon";
import PackingList from "../components/PackingList";
import Scenery from "../components/Scenery";
import { sceneForDestination } from "../data/destinations";
import type { ActivityCategory, Trip } from "../types/trip";
import { spendingByCategory, totalSpent } from "../utils/budget";
import { formatDateRange, formatDay, formatDayNumber, formatWeekday } from "../utils/dates";
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

const categoryIcons: Record<ActivityCategory, IconName> = {
  activity: "pin",
  food: "food",
  transport: "plane",
  stay: "bed",
};

export default function TripDetailPage({ trip, onUpdate }: TripDetailPageProps) {
  const scene = sceneForDestination(trip.destination);
  const dayCount = trip.days.length;
  // "Lisbon, Portugal" becomes "Lisbon", for the link to search its sights.
  const city = trip.destination.split(",")[0].trim() || trip.destination;

  function handleAddActivity(date: string, input: ActivityFormInput) {
    onUpdate(addActivity(trip, date, input));
  }

  return (
    <article className="trip-detail">
      <header className="trip-hero">
        <div className="container trip-hero-inner">
          <div>
            <Link className="back-link" to="/#trips">
              ← All trips
            </Link>
            <h1>{trip.name}</h1>
            <ul className="trip-hero-meta">
              <li>
                <Icon name="pin" size={16} />
                <span>{trip.destination}</span>
              </li>
              <li>
                <Icon name="calendar" size={16} />
                <span>{formatDateRange(trip.startDate, trip.endDate, true)}</span>
              </li>
              <li>
                <Icon name="clock" size={16} />
                <span>
                  {dayCount} {dayCount === 1 ? "day" : "days"}
                </span>
              </li>
            </ul>
            <Link className="trip-hero-explore" to={`/explore?q=${encodeURIComponent(city)}`}>
              <Icon name="pin" size={16} />
              Find sights in {city}
            </Link>
          </div>

          <div className="trip-hero-art">
            <Scenery variant={scene.scene} palette={scene.palette} />
          </div>
        </div>
      </header>

      <div className="container">
        <div className="trip-summary">
          <div className="trip-summary-budget">
            <h2>Budget</h2>
            <BudgetBar spent={totalSpent(trip)} budget={trip.budget} />
          </div>
          <CategoryBreakdown totals={spendingByCategory(trip)} />
        </div>

        <div className="trip-layout">
          <div className="trip-days">
            {dayCount === 0 && <p className="empty-state">This trip has no days yet.</p>}

            {trip.days.map((day) => (
              <section key={day.date} className="day" aria-labelledby={`day-${day.date}`}>
                <div className="day-head">
                  <span className="day-badge" aria-hidden="true">
                    <span>{formatWeekday(day.date)}</span>
                    <strong>{formatDayNumber(day.date)}</strong>
                  </span>
                  <h2 id={`day-${day.date}`}>{formatDay(day.date)}</h2>
                </div>

                {day.activities.length === 0 ? (
                  <p className="empty-state">No activities yet.</p>
                ) : (
                  <ol className="activity-list">
                    {day.activities.map((activity, index) => (
                      <li key={activity.id} className="activity-item">
                        <span className={`activity-icon cat-${activity.category}`}>
                          <Icon name={categoryIcons[activity.category]} size={18} />
                        </span>
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

                <AddActivityForm
                  date={day.date}
                  onAdd={(input) => handleAddActivity(day.date, input)}
                />
              </section>
            ))}
          </div>

          <aside className="trip-aside">
            <PackingList
              items={trip.packing}
              onAdd={(label) => onUpdate(addPackingItem(trip, label))}
              onToggle={(id) => onUpdate(togglePackingItem(trip, id))}
            />
          </aside>
        </div>
      </div>
    </article>
  );
}
