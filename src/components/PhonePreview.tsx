import { sceneForDestination } from "../data/destinations";
import { sampleTrips } from "../data/sampleTrips";
import type { ActivityCategory, Trip } from "../types/trip";
import { budgetPercent, isOverBudget, totalSpent } from "../utils/budget";
import { formatDateRange, formatDayNumber, formatWeekday } from "../utils/dates";
import Icon, { type IconName } from "./Icon";
import Scenery from "./Scenery";

interface PhonePreviewProps {
  /** The trip to preview. Falls back to a sample trip when there is none. */
  trip?: Trip;
}

const categoryIcons: Record<ActivityCategory, IconName> = {
  activity: "pin",
  food: "food",
  transport: "plane",
  stay: "bed",
};

const MAX_DAYS = 5;
const MAX_ACTIVITIES = 3;

/**
 * A phone-shaped preview of a trip, used as the hero illustration. It repeats
 * information shown elsewhere on the page, so it is hidden from screen readers.
 */
export default function PhonePreview({ trip = sampleTrips[0] }: PhonePreviewProps) {
  const scene = sceneForDestination(trip.destination);
  const days = trip.days.slice(0, MAX_DAYS);
  // Show the first day that has something planned, or the first day.
  const activeDay = trip.days.find((day) => day.activities.length > 0) ?? trip.days[0];
  const activities = activeDay?.activities.slice(0, MAX_ACTIVITIES) ?? [];
  const spent = totalSpent(trip);

  return (
    <div className="phone" aria-hidden="true">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="phone-map">
          <Scenery variant={scene.scene} palette={scene.palette} />
          <svg className="phone-route" viewBox="0 0 200 150" preserveAspectRatio="none">
            <path
              d="M30 118C60 70 92 128 118 84S168 70 176 40"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="1 8"
            />
            <circle cx="30" cy="118" r="6" fill="#fff" />
            <circle cx="30" cy="118" r="3" fill="#0b3f45" />
            <circle cx="118" cy="84" r="6" fill="#fff" />
            <circle cx="118" cy="84" r="3" fill="#1dc98c" />
            <circle cx="176" cy="40" r="6" fill="#fff" />
            <circle cx="176" cy="40" r="3" fill="#4a2aa8" />
          </svg>
        </div>

        <div className="phone-sheet">
          <div>
            <p className="phone-title">{trip.name}</p>
            <p className="phone-meta">
              {formatDateRange(trip.startDate, trip.endDate)} · {trip.destination}
            </p>
          </div>

          <div className="phone-days">
            {days.map((day) => (
              <span
                key={day.date}
                className={day === activeDay ? "phone-day is-active" : "phone-day"}
              >
                {formatWeekday(day.date)}
                <strong>{formatDayNumber(day.date)}</strong>
              </span>
            ))}
          </div>

          <div className="phone-activities">
            {activities.length === 0 ? (
              <p className="phone-empty">Nothing planned yet. Add your first activity.</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="phone-activity">
                  <span className={`phone-activity-icon cat-${activity.category}`}>
                    <Icon name={categoryIcons[activity.category]} size={12} />
                  </span>
                  <span className="phone-activity-text">
                    <strong>{activity.title}</strong>
                    <span>{activity.time ?? activity.category}</span>
                  </span>
                  <span className="phone-activity-cost">{activity.cost}</span>
                </div>
              ))
            )}
          </div>

          <div className="phone-budget">
            <div className={isOverBudget(trip) ? "budget-track over" : "budget-track"}>
              <div
                className="budget-fill"
                style={{ width: `${budgetPercent(spent, trip.budget)}%` }}
              />
            </div>
            <p>
              {spent} of {trip.budget} spent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
