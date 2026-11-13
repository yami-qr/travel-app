import type { Trip } from "../types/trip";
import { totalSpent } from "../utils/budget";
import BudgetBar from "./BudgetBar";

interface TripCardProps {
  trip: Trip;
}

function formatDateRange(start: string, end: string): string {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const from = new Date(start).toLocaleDateString("en-GB", options);
  const to = new Date(end).toLocaleDateString("en-GB", options);
  return `${from} – ${to}`;
}

export default function TripCard({ trip }: TripCardProps) {
  const activityCount = trip.days.reduce((n, day) => n + day.activities.length, 0);

  return (
    <li className="trip-card">
      <h3>{trip.name}</h3>
      <p>{trip.destination}</p>
      <p>{formatDateRange(trip.startDate, trip.endDate)}</p>
      <p>
        {activityCount} {activityCount === 1 ? "activity" : "activities"}
      </p>
      <BudgetBar spent={totalSpent(trip)} budget={trip.budget} />
    </li>
  );
}
