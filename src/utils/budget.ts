import type { ActivityCategory, Trip } from "../types/trip";

/** Sum of every activity cost across all days of a trip. */
export function totalSpent(trip: Trip): number {
  return trip.days
    .flatMap((day) => day.activities)
    .reduce((sum, activity) => sum + activity.cost, 0);
}

/** Budget left after spending. Negative when the trip is over budget. */
export function remainingBudget(trip: Trip): number {
  return trip.budget - totalSpent(trip);
}

/** True only when spending is strictly greater than the budget. */
export function isOverBudget(trip: Trip): boolean {
  return totalSpent(trip) > trip.budget;
}

/** Spending per category. Every category is present, even when it is zero. */
export function spendingByCategory(trip: Trip): Record<ActivityCategory, number> {
  const totals: Record<ActivityCategory, number> = {
    food: 0,
    transport: 0,
    stay: 0,
    activity: 0,
  };

  for (const day of trip.days) {
    for (const activity of day.activities) {
      totals[activity.category] += activity.cost;
    }
  }

  return totals;
}
