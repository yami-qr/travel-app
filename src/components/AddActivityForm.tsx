import { useState, type FormEvent } from "react";
import type { ActivityCategory } from "../types/trip";
import {
  validateActivityInput,
  type ActivityFormErrors,
  type ActivityFormInput,
} from "../utils/itinerary";

interface AddActivityFormProps {
  /** Date label used to make the field ids unique when several days show forms. */
  date: string;
  onAdd: (input: ActivityFormInput) => void;
}

const emptyForm: ActivityFormInput = {
  title: "",
  time: "",
  cost: "",
  category: "activity",
};

const categories: ActivityCategory[] = ["activity", "food", "transport", "stay"];

export default function AddActivityForm({ date, onAdd }: AddActivityFormProps) {
  const [values, setValues] = useState<ActivityFormInput>(emptyForm);
  const [errors, setErrors] = useState<ActivityFormErrors>({});
  const idPrefix = `activity-${date}`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateActivityInput(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onAdd(values);
      setValues(emptyForm);
    }
  }

  return (
    <form className="activity-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor={`${idPrefix}-title`}>Activity</label>
        <input
          id={`${idPrefix}-title`}
          type="text"
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && <p className="field-error">{errors.title}</p>}
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-time`}>Time</label>
        <input
          id={`${idPrefix}-time`}
          type="time"
          value={values.time}
          onChange={(e) => setValues({ ...values, time: e.target.value })}
          aria-invalid={Boolean(errors.time)}
        />
        {errors.time && <p className="field-error">{errors.time}</p>}
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-cost`}>Cost</label>
        <input
          id={`${idPrefix}-cost`}
          type="number"
          min="0"
          step="any"
          value={values.cost}
          onChange={(e) => setValues({ ...values, cost: e.target.value })}
          aria-invalid={Boolean(errors.cost)}
        />
        {errors.cost && <p className="field-error">{errors.cost}</p>}
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-category`}>Category</label>
        <select
          id={`${idPrefix}-category`}
          value={values.category}
          onChange={(e) =>
            setValues({ ...values, category: e.target.value as ActivityCategory })
          }
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <button className="btn btn-primary" type="submit">
        Add activity
      </button>
    </form>
  );
}
