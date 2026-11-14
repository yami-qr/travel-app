import { Link } from "react-router-dom";
import type { Trip } from "../types/trip";
import { totalSpent } from "../utils/budget";
import { destinationCode } from "../utils/codes";
import { formatDateRange } from "../utils/dates";
import BudgetBar from "./BudgetBar";
import Icon from "./Icon";

interface TripCardProps {
  trip: Trip;
}

/** A trip drawn as a boarding pass: route on the left, budget on the tear-off stub. */
export default function TripCard({ trip }: TripCardProps) {
  const activityCount = trip.days.reduce((n, day) => n + day.activities.length, 0);
  const dayCount = trip.days.length;

  return (
    <li className="pass">
      <div className="pass-main">
        <div className="pass-top">
          <span className="pass-label">Boarding pass</span>
          <span className="pass-days">
            {dayCount} {dayCount === 1 ? "day" : "days"}
          </span>
        </div>

        <div className="pass-route" aria-hidden="true">
          <span className="pass-code">YOU</span>
          <span className="pass-line">
            <Icon name="plane" size={16} />
          </span>
          <span className="pass-code is-to">{destinationCode(trip.destination)}</span>
        </div>

        <h3>
          <Link to={`/trips/${trip.id}`}>{trip.name}</Link>
        </h3>

        <dl className="pass-details">
          <div>
            <dt>To</dt>
            <dd>{trip.destination}</dd>
          </div>
          <div>
            <dt>Dates</dt>
            <dd>{formatDateRange(trip.startDate, trip.endDate)}</dd>
          </div>
          <div>
            <dt>Plans</dt>
            <dd>
              {activityCount} {activityCount === 1 ? "activity" : "activities"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="pass-stub">
        <span className="pass-label">Budget</span>
        <BudgetBar spent={totalSpent(trip)} budget={trip.budget} />
      </div>
    </li>
  );
}
