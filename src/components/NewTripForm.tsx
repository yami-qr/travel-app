import { useState, type FormEvent } from "react";
import type { Trip } from "../types/trip";
import {
  createTrip,
  validateTripInput,
  type TripFormErrors,
  type TripFormInput,
} from "../utils/trips";

interface NewTripFormProps {
  onCreate: (trip: Trip) => void;
  onCancel: () => void;
}

const emptyForm: TripFormInput = {
  name: "",
  destination: "",
  startDate: "",
  endDate: "",
  budget: "",
};

export default function NewTripForm({ onCreate, onCancel }: NewTripFormProps) {
  const [values, setValues] = useState<TripFormInput>(emptyForm);
  const [errors, setErrors] = useState<TripFormErrors>({});

  function handleChange(field: keyof TripFormInput, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateTripInput(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onCreate(createTrip(values));
    }
  }

  return (
    <form className="trip-form" onSubmit={handleSubmit} noValidate>
      <h2>Plan a new trip</h2>

      <div className="field">
        <label htmlFor="trip-name">Trip name</label>
        <input
          id="trip-name"
          type="text"
          value={values.name}
          onChange={(e) => handleChange("name", e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "trip-name-error" : undefined}
        />
        {errors.name && (
          <p id="trip-name-error" className="field-error">
            {errors.name}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="trip-destination">Destination</label>
        <input
          id="trip-destination"
          type="text"
          value={values.destination}
          onChange={(e) => handleChange("destination", e.target.value)}
          aria-invalid={Boolean(errors.destination)}
          aria-describedby={errors.destination ? "trip-destination-error" : undefined}
        />
        {errors.destination && (
          <p id="trip-destination-error" className="field-error">
            {errors.destination}
          </p>
        )}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="trip-start">Start date</label>
          <input
            id="trip-start"
            type="date"
            value={values.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            aria-invalid={Boolean(errors.startDate)}
            aria-describedby={errors.startDate ? "trip-start-error" : undefined}
          />
          {errors.startDate && (
            <p id="trip-start-error" className="field-error">
              {errors.startDate}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="trip-end">End date</label>
          <input
            id="trip-end"
            type="date"
            value={values.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
            aria-invalid={Boolean(errors.endDate)}
            aria-describedby={errors.endDate ? "trip-end-error" : undefined}
          />
          {errors.endDate && (
            <p id="trip-end-error" className="field-error">
              {errors.endDate}
            </p>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="trip-budget">Budget</label>
        <input
          id="trip-budget"
          type="number"
          min="0"
          step="1"
          inputMode="decimal"
          value={values.budget}
          onChange={(e) => handleChange("budget", e.target.value)}
          aria-invalid={Boolean(errors.budget)}
          aria-describedby={errors.budget ? "trip-budget-error" : undefined}
        />
        {errors.budget && (
          <p id="trip-budget-error" className="field-error">
            {errors.budget}
          </p>
        )}
      </div>

      <div className="form-actions">
        <button className="btn" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary" type="submit">
          Create trip
        </button>
      </div>
    </form>
  );
}
