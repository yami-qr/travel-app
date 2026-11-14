import { useFavourites } from "../context/FavouritesContext";
import type { FavouritePlace } from "../services/favourites";

interface FavouriteButtonProps {
  place: Omit<FavouritePlace, "savedAt">;
  /** "icon" is a round heart for cards; "full" adds a text label. */
  variant?: "icon" | "full";
}

/** Heart toggle that saves a destination to favourites. */
export default function FavouriteButton({ place, variant = "icon" }: FavouriteButtonProps) {
  const { isFavourite, toggle } = useFavourites();
  const saved = isFavourite(place.id);

  return (
    <button
      type="button"
      className={`fav-button fav-${variant}${saved ? " is-saved" : ""}`}
      aria-pressed={saved}
      aria-label={variant === "icon" ? `Save ${place.name} to favourites` : undefined}
      onClick={(event) => {
        // Cards are links; a click on the heart should not open the card.
        event.preventDefault();
        event.stopPropagation();
        toggle(place);
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
        <path
          d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.2 0 3.6 1.2 4.3 2.4h2c.7-1.2 2.1-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21Z"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {variant === "full" && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
