import { useState, type FormEvent } from "react";
import type { PackingItem } from "../types/trip";

interface PackingListProps {
  items: PackingItem[];
  onAdd: (label: string) => void;
  onToggle: (id: string) => void;
}

export default function PackingList({ items, onAdd, onToggle }: PackingListProps) {
  const [label, setLabel] = useState("");
  const packedCount = items.filter((item) => item.packed).length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!label.trim()) return;
    onAdd(label);
    setLabel("");
  }

  return (
    <section className="packing" aria-labelledby="packing-heading">
      <h2 id="packing-heading">Packing list</h2>
      <p className="muted">
        {packedCount} of {items.length} packed
      </p>

      <ul className="packing-list">
        {items.map((item) => (
          <li key={item.id}>
            <label className="packing-item">
              <input
                type="checkbox"
                checked={item.packed}
                onChange={() => onToggle(item.id)}
              />
              <span className={item.packed ? "packed" : undefined}>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>

      <form className="packing-form" onSubmit={handleSubmit}>
        <label htmlFor="packing-input" className="sr-only">
          New packing item
        </label>
        <input
          id="packing-input"
          type="text"
          placeholder="Add an item, e.g. charger"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <button className="btn" type="submit">
          Add
        </button>
      </form>
    </section>
  );
}
