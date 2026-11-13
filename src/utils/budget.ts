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

/**
 * Percentage of the budget that has been spent, capped at 100 so a progress
 * bar never overflows. Returns 0 when the budget is zero or less.
 */
export function budgetPercent(spent: number, budget: number): number {
  if (budget <= 0) return 0;
  return Math.min((spent / budget) * 100, 100);
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
