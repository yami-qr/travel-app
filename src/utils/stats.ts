import type { Trip } from "../types/trip";
import { totalSpent } from "./budget";

export interface TripStats {
  trips: number;
  days: number;
  activities: number;
  /** Sum of every trip's budget. */
  budget: number;
  /** Sum of every activity cost across all trips. */
  spent: number;
}

/** Totals across every trip, for the summary tiles on the home page. */
export function tripStats(trips: Trip[]): TripStats {
  return trips.reduce<TripStats>(
    (stats, trip) => ({
      trips: stats.trips + 1,
      days: stats.days + trip.days.length,
      activities:
        stats.activities + trip.days.reduce((n, day) => n + day.activities.length, 0),
      budget: stats.budget + trip.budget,
      spent: stats.spent + totalSpent(trip),
    }),
    { trips: 0, days: 0, activities: 0, budget: 0, spent: 0 },
  );
}

/** Formats a population as "517,802", or "5.6M" when large. Empty when unknown. */
export function formatPopulation(population: number | undefined): string {
  if (!population) return "";
  if (population >= 1_000_000) return `${(population / 1_000_000).toFixed(1)}M`;
  return population.toLocaleString("en-GB");
}

/** Whole numbers with thousands separators: 1800 becomes "1,800". */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("en-GB");
}
