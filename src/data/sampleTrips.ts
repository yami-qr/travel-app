import type { Trip } from "../types/trip";
import { dateRange } from "../utils/trips";

/** Default trips, shown on the first visit before anything has been saved. */
export const sampleTrips: Trip[] = [
  {
    id: "trip-1",
    name: "Lisbon weekend",
    destination: "Lisbon, Portugal",
    startDate: "2027-03-12",
    endDate: "2027-03-15",
    budget: 600,
    days: dateRange("2027-03-12", "2027-03-15").map((date) => ({
      date,
      activities:
        date === "2027-03-12"
          ? [
              { id: "a1", title: "Airport transfer", time: "10:30", cost: 20, category: "transport" as const },
              { id: "a2", title: "Pastéis de Belém", time: "15:00", cost: 8, category: "food" as const },
            ]
          : [],
    })),
    packing: [{ id: "p1", label: "Passport", packed: false }],
  },
  {
    id: "trip-2",
    name: "Kyoto spring",
    destination: "Kyoto, Japan",
    startDate: "2027-04-02",
    endDate: "2027-04-09",
    budget: 1800,
    days: dateRange("2027-04-02", "2027-04-09").map((date) => ({ date, activities: [] })),
    packing: [],
  },
];
