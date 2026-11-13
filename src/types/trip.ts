export type ActivityCategory = "food" | "transport" | "stay" | "activity";

export interface Activity {
  id: string;
  title: string;
  /** Time of day in 24-hour "HH:mm" format, optional. */
  time?: string;
  /** Cost in the trip's currency. */
  cost: number;
  category: ActivityCategory;
}

export interface Day {
  /** ISO date string, "YYYY-MM-DD". */
  date: string;
  activities: Activity[];
}

export interface PackingItem {
  id: string;
  label: string;
  packed: boolean;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  /** ISO date string, "YYYY-MM-DD". */
  startDate: string;
  /** ISO date string, "YYYY-MM-DD". */
  endDate: string;
  budget: number;
  days: Day[];
  packing: PackingItem[];
}
