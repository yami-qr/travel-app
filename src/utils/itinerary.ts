import type { Activity, ActivityCategory, Trip } from "../types/trip";

/** Raw values from the add-activity form. */
export interface ActivityFormInput {
  title: string;
  time: string;
  cost: string;
  category: ActivityCategory;
}

export type ActivityFormErrors = Partial<Record<keyof ActivityFormInput, string>>;

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateActivityInput(input: ActivityFormInput): ActivityFormErrors {
  const errors: ActivityFormErrors = {};

  if (!input.title.trim()) {
    errors.title = "Give the activity a title.";
  }

  if (input.time && !TIME_PATTERN.test(input.time)) {
    errors.time = "Use a 24-hour time such as 09:30.";
  }

  const cost = Number(input.cost);
  if (!input.cost.trim() || !Number.isFinite(cost) || cost < 0) {
    errors.cost = "Enter a cost of 0 or more.";
  }

  return errors;
}

/** Appends an activity to the given day. Returns a new trip; the original is not changed. */
export function addActivity(
  trip: Trip,
  date: string,
  input: ActivityFormInput,
  id: string = makeId("act"),
): Trip {
  const activity: Activity = {
    id,
    title: input.title.trim(),
    time: input.time || undefined,
    cost: Number(input.cost),
    category: input.category,
  };

  return {
    ...trip,
    days: trip.days.map((day) =>
      day.date === date ? { ...day, activities: [...day.activities, activity] } : day,
    ),
  };
}

export function removeActivity(trip: Trip, date: string, activityId: string): Trip {
  return {
    ...trip,
    days: trip.days.map((day) =>
      day.date === date
        ? { ...day, activities: day.activities.filter((a) => a.id !== activityId) }
        : day,
    ),
  };
}

/** Moves an activity one place up (-1) or down (+1) within its day. Does nothing at the edges. */
export function moveActivity(
  trip: Trip,
  date: string,
  activityId: string,
  direction: -1 | 1,
): Trip {
  return {
    ...trip,
    days: trip.days.map((day) => {
      if (day.date !== date) return day;

      const index = day.activities.findIndex((a) => a.id === activityId);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= day.activities.length) return day;

      const activities = [...day.activities];
      [activities[index], activities[target]] = [activities[target], activities[index]];
      return { ...day, activities };
    }),
  };
}

/** Adds a packing item. Blank labels are ignored. */
export function addPackingItem(trip: Trip, label: string, id: string = makeId("pack")): Trip {
  const trimmed = label.trim();
  if (!trimmed) return trip;

  return {
    ...trip,
    packing: [...trip.packing, { id, label: trimmed, packed: false }],
  };
}

export function togglePackingItem(trip: Trip, itemId: string): Trip {
  return {
    ...trip,
    packing: trip.packing.map((item) =>
      item.id === itemId ? { ...item, packed: !item.packed } : item,
    ),
  };
}
