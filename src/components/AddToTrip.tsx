import { useId, useState, type FormEvent } from "react";
import type { Trip } from "../types/trip";
import { formatDay } from "../utils/dates";

interface AddToTripProps {
  /** Name of the sight being added, e.g. "São Jorge Castle". */
  title: string;
  trips: Trip[];
  /** Trip to pick first, usually one going to this destination. */
  preferredTripId?: string;
  onAdd: (tripId: string, date: string) => void;
  /** Starts a new trip when there are none to add to. */
  onCreateTrip: () => void;
}

/**
 * "Add to trip" button that opens a small form to choose a trip and a day.
 * After adding, it confirms where the sight went.
 */
export default function AddToTrip({ title, trips, preferredTripId, onAdd, onCreateTrip }: AddToTripProps) {
  const [open, setOpen] = useState(false);
  const [tripId, setTripId] = useState(preferredTripId ?? trips[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [added, setAdded] = useState<string | null>(null);
  const id = useId();

  const trip = trips.find((t) => t.id === tripId);
  const chosenDate = date || trip?.days[0]?.date || "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trip || !chosenDate) return;
    onAdd(trip.id, chosenDate);
    setAdded(`Added to ${trip.name}, ${formatDay(chosenDate)}`);
    setOpen(false);
  }

  if (trips.length === 0) {
    return (
      <button className="btn btn-small" type="button" onClick={onCreateTrip}>
        Start a trip to add this
      </button>
    );
  }

  return (
    <div className="add-to-trip">
      {!open && (
        <button
          className="btn btn-small"
          type="button"
          onClick={() => {
            setOpen(true);
            setAdded(null);
          }}
          aria-label={`Add ${title} to a trip`}
        >
          + Add to trip
        </button>
      )}

      {open && (
        <form className="add-to-trip-form" onSubmit={handleSubmit} aria-label={`Add ${title} to a trip`}>
          <label htmlFor={`${id}-trip`}>Trip</label>
          <select
            id={`${id}-trip`}
            className="input"
            value={tripId}
            onChange={(e) => {
              setTripId(e.target.value);
              setDate("");
            }}
          >
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <label htmlFor={`${id}-day`}>Day</label>
          <select
            id={`${id}-day`}
            className="input"
            value={chosenDate}
            onChange={(e) => setDate(e.target.value)}
            disabled={!trip || trip.days.length === 0}
          >
            {trip?.days.map((day) => (
              <option key={day.date} value={day.date}>
                {formatDay(day.date)}
              </option>
            ))}
          </select>

          <div className="add-to-trip-actions">
            <button className="btn btn-small btn-ghost" type="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-small btn-primary" type="submit" disabled={!chosenDate}>
              Add
            </button>
          </div>
        </form>
      )}

      <p className="add-to-trip-status" role="status">
        {added}
      </p>
    </div>
  );
}
