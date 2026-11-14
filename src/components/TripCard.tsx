import { Link } from "react-router-dom";
import { sceneForDestination } from "../data/destinations";
import type { Trip } from "../types/trip";
import { totalSpent } from "../utils/budget";
import { formatDateRange } from "../utils/dates";
import BudgetBar from "./BudgetBar";
import Icon from "./Icon";
import Scenery from "./Scenery";

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  const activityCount = trip.days.reduce((n, day) => n + day.activities.length, 0);
  const dayCount = trip.days.length;
  const scene = sceneForDestination(trip.destination);

  return (
    <li className="trip-card">
      <div className="trip-card-cover">
        <Scenery variant={scene.scene} palette={scene.palette} />
        <span className="trip-card-days">
          {dayCount} {dayCount === 1 ? "day" : "days"}
        </span>
      </div>

      <div className="trip-card-body">
        <h3>
          <Link to={`/trips/${trip.id}`}>{trip.name}</Link>
        </h3>
        <p className="trip-card-place">
          <Icon name="pin" size={14} />
          <span>{trip.destination}</span>
        </p>
        <p className="trip-card-meta">{formatDateRange(trip.startDate, trip.endDate)}</p>
        <p className="trip-card-meta">
          {activityCount} {activityCount === 1 ? "activity" : "activities"}
        </p>
        <BudgetBar spent={totalSpent(trip)} budget={trip.budget} />
      </div>
    </li>
  );
}
