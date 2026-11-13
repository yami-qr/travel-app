import type { Day, Trip } from "../types/trip";

/** Raw values from the new-trip form. Everything is a string because that is what inputs give us. */
export interface TripFormInput {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
}

export type TripFormErrors = Partial<Record<keyof TripFormInput, string>>;

/** Returns an error message for each invalid field. An empty object means the input is valid. */
export function validateTripInput(input: TripFormInput): TripFormErrors {
  const errors: TripFormErrors = {};

  if (!input.name.trim()) {
    errors.name = "Give your trip a name.";
  }
  if (!input.destination.trim()) {
    errors.destination = "Add a destination.";
  }
  if (!input.startDate) {
    errors.startDate = "Pick a start date.";
  }
  if (!input.endDate) {
    errors.endDate = "Pick an end date.";
  }
  // ISO "YYYY-MM-DD" strings sort correctly as plain strings.
  if (input.startDate && input.endDate && input.endDate < input.startDate) {
    errors.endDate = "The end date can't be before the start date.";
  }

  const budget = Number(input.budget);
  if (!input.budget.trim() || !Number.isFinite(budget) || budget <= 0) {
    errors.budget = "Enter a budget greater than 0.";
  }

  return errors;
}

/** Every date from start to end inclusive, as "YYYY-MM-DD" strings. Uses UTC to avoid timezone shifts. */
export function dateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${startDate}T00:00:00Z`);
  const last = new Date(`${endDate}T00:00:00Z`);

  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

function newTripId(): string {
  return `trip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Builds a Trip from validated form input, with one empty Day per date in the range.
 * Call validateTripInput first; this function assumes the input is valid.
 */
export function createTrip(input: TripFormInput, id: string = newTripId()): Trip {
  const days: Day[] = dateRange(input.startDate, input.endDate).map((date) => ({
    date,
    activities: [],
  }));

  return {
    id,
    name: input.name.trim(),
    destination: input.destination.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    budget: Number(input.budget),
    days,
    packing: [],
  };
}
